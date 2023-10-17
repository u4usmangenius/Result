const express = require("express");
const router = express.Router();
const db = require("../db/Sqlite").db;
const crypto = require("crypto"); // Import the crypto module
const { verifyToken } = require("./authMiddleware");
const PDFDocument = require("pdfkit");

// send data matched with ClassName
router.post("/api/results/ClassName", verifyToken, (req, res) => {
  const { ClassName } = req.body;

  db.all(
    "SELECT * FROM result WHERE ClassName = ?",
    [ClassName],
    (err, rows) => {
      if (err) {
        console.error("Error fetching result data:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else {
        if (rows.length === 0) {
          res.status(404).json({
            success: false,
            message: "No results found for the provided ClassName",
          });
        } else {
          console.log("data===___>", { data: rows });
          res.json({ success: true, data: rows });
        }
      }
    }
  );
});

// Endpoint for sending selected ClassName related test and student info

router.post("/api/results/data", verifyToken, (req, res) => {
  const { ClassName } = req.body;
  if (!ClassName) {
    return res
      .status(400)
      .json({ error: "Class name is required in the request body" });
  }

  // Create a SQL query to fetch student data
  const studentSql = `
    SELECT stdRollNo, fullName, studentId
    FROM students
    WHERE ClassName = ?
  `;
  // Create a SQL query to fetch student related subjects data
  const subjectsSql = `
    SELECT s.studentId, sub.subjectName
    FROM students s
    LEFT JOIN student_subject ss ON s.studentId = ss.studentId
    LEFT JOIN subjects sub ON ss.subjectId = sub.subjectId
    WHERE s.ClassName = ?
  `;
  // Create a SQL query to fetch tests data
  const testsSql = `
    SELECT *
    FROM tests
    WHERE ClassName = ?
  `;

  const studentData = [];
  const testsData = [];
  const studentSubject = [];

  // Execute the student data query
  db.all(studentSql, [ClassName], (err, studentRows) => {
    if (err) {
      console.error("Error fetching student data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data" });
    }
    db.all(subjectsSql, [ClassName], (err, subjectsRows) => {
      if (err) {
        console.error("Error fetching subjects data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
      studentRows.forEach((student) => {
        const { studentId } = student;
        const subjects = subjectsRows
          .filter((subject) => subject.studentId === studentId)
          .map((subject) => subject.subjectName);

        studentSubject.push({ studentId, subjects });
      });
      studentData.push(...studentRows);
    });

    // Execute the tests data query
    db.all(testsSql, [ClassName], (err, testsRows) => {
      if (err) {
        console.error("Error fetching tests data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }

      testsData.push(...testsRows);

      // Send both arrays in the response
      res.json({ studentData, testsData, studentSubject });
    });
  });
});

// Search and get all data from the database with filtering and sorting
router.post("/api/results/search", verifyToken, (req, res) => {
  const { searchText, selectedFilter, sortColumn, sortOrder } = req.body;
  const page = parseInt(req.body.page) || 1;
  const pageSize = parseInt(req.body.pageSize) || 5;
  const offset = (page - 1) * pageSize;

  let query = `
    SELECT resultId, fullName, stdRollNo, TestName, TotalMarks, SubjectName, ClassName, ObtainedMarks, stdTestPercentage FROM result
    WHERE 1=1`;

  const params = [];

  if (
    selectedFilter === "fullName" ||
    selectedFilter === "stdRollNo" ||
    selectedFilter === "TestName" ||
    selectedFilter === "TotalMarks" ||
    selectedFilter === "SubjectName" ||
    selectedFilter === "ClassName" ||
    selectedFilter === "ObtainedMarks"
  ) {
    query += ` AND ${selectedFilter} LIKE ?`;
    params.push(`%${searchText}%`);
  } else {
    query += ` AND (fullName LIKE ? OR stdRollNo LIKE ? OR TestName LIKE ? OR TotalMarks LIKE ? OR SubjectName LIKE ? OR ClassName LIKE ? OR ObtainedMarks LIKE ?)`;
    params.push(
      `%${searchText}%`,
      `%${searchText}%`,
      `%${searchText}%`,
      `%${searchText}%`,
      `%${searchText}%`,
      `%${searchText}%`,
      `%${searchText}%`
    );
  }

  // Add sorting to the query if sortColumn and sortOrder are provided
  if (sortColumn && sortOrder) {
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error searching and sorting results:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      const totalCount = rows.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Calculate the slice of results for the current page
      const startIndex = offset;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      const pageResults = rows.slice(startIndex, endIndex);
      console.log("pageResults", pageResults);
      res.json({
        success: true,
        results: pageResults,
        totalPages,
        sortColumn,
        sortOrder,
      });
    }
  });
});
//  result data
// Get result data with filtering and sorting
router.post("/api/result", verifyToken, (req, res) => {
  const page = parseInt(req.body.page) || 1;
  const pageSize = parseInt(req.body.pageSize) || 5;
  const filter = req.body.filter || "";
  const search = req.body.search || "";
  const sortColumn = req.body.sortColumn || "TestName"; // Default sorting column
  const sortOrder = req.body.sortOrder || "asc"; // Default sorting order (ascending)
  const offset = (page - 1) * pageSize;

  let query = `
            SELECT resultId, fullName, stdRollNo, TestName, TotalMarks, SubjectName, ClassName, ObtainedMarks, stdTestPercentage FROM result 
            WHERE 1=1`;

  const params = [];

  if (
    filter === "stdRollNo" ||
    filter === "fullName" ||
    filter === "TestName" ||
    filter === "TotalMarks" ||
    filter === "SubjectName" ||
    filter === "ClassName" ||
    filter === "ObtainedMarks"
  ) {
    query += ` AND ${filter} LIKE ?`;
    params.push(`%${search}%`);
  } else if (filter === "all") {
    query += ` AND (fullName LIKE ? OR stdRollNo LIKE ? OR TestName LIKE ? OR TotalMarks LIKE ? OR SubjectName LIKE ? OR ClassName LIKE ? OR ObtainedMarks LIKE ?)`;
    params.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    );
  }

  // Add sorting to the query
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error getting results:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      const totalCount = rows.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      const startIndex = offset;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      const pageResults = rows.slice(startIndex, endIndex);

      res.json({ success: true, results: pageResults, totalPages });
    }
  });
});
// store result
router.post("/api/results", verifyToken, (req, res) => {
  const { stdRollNo, TestName, ObtainedMarks, ClassName, stdTestPercentage } =
    req.body;
  console.log(req.body);
  if (
    !stdRollNo ||
    !TestName ||
    !ClassName ||
    !ObtainedMarks ||
    !stdTestPercentage
  ) {
    return res.status(400).json({ error: "All Fields are required." });
  }
  db.get(
    "SELECT COUNT(*) as count FROM result WHERE stdRollNo = ? AND TestName = ? AND ClassName= ? AND stdTestPercentage= ?",
    [stdRollNo, TestName, ClassName, stdTestPercentage],
    (err, result) => {
      if (err) {
        console.error("Error checking if record exists:", err);
        console.log("here 1");
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const recordCount = result.count;
      if (recordCount > 0) {
        return res.status(409).json({ error: "Record already exists." });
      }
      db.get(
        "SELECT testId, TotalMarks, SubjectName,TestDate FROM tests WHERE TestName = ?",
        [TestName],
        (err, testRow) => {
          if (err) {
            console.error("Error checking if test exists:", err);
            console.log("here 2");
            return res.status(500).json({ error: "Internal Server Error" });
          }

          if (!testRow) {
            return res.status(404).json({ error: "Test not found." });
          }
          const { testId, TotalMarks, SubjectName, TestDate } = testRow;
          if (ObtainedMarks > TotalMarks) {
            return res.status(400).json({
              error: "Obtained marks cannot be greater than TotalMarks.",
            });
          }

          db.get(
            "SELECT studentId, fullName FROM students WHERE stdRollNo = ?",
            [stdRollNo],
            (err, studentRow) => {
              if (err) {
                console.error("Error checking if student exists:", err);
                console.log("here 3");

                return res.status(500).json({ error: "Internal Server Error" });
              }

              if (!studentRow) {
                return res.status(404).json({ error: "Student not found." });
              }

              const { studentId, fullName } = studentRow;

              const resultId = crypto.randomUUID(); // Generate a random UUID

              db.run(
                "INSERT INTO result (resultId, fullName, stdRollNo, TestName, ObtainedMarks, studentId, testId, TotalMarks, SubjectName, ClassName, stdTestPercentage,TestDate) VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                  resultId,
                  fullName,
                  stdRollNo,
                  TestName,
                  ObtainedMarks,
                  studentId,
                  testId,
                  TotalMarks,
                  SubjectName,
                  ClassName,
                  stdTestPercentage,
                  TestDate,
                ],
                (err) => {
                  if (err) {
                    console.error(
                      "Error inserting data into result table:",
                      err
                    );
                    console.log("here 5");

                    return res
                      .status(500)
                      .json({ error: "Internal Server Error" });
                  }
                  return res
                    .status(200)
                    .json({ message: "Data inserted successfully" });
                }
              );
            }
          );
        }
      );
    }
  );
});
// Update Result Api
router.put("/api/results/:resultId", verifyToken, (req, res) => {
  const resultId = req.params.resultId;
  const { stdRollNo, TestName, ClassName, ObtainedMarks, stdTestPercentage } =
    req.body;

  if (
    !stdRollNo ||
    !ObtainedMarks ||
    !TestName ||
    !ClassName ||
    !stdTestPercentage
  ) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }

  const studentSql = `
    SELECT fullName, studentId
    FROM students
    WHERE ClassName = ? AND stdRollNo = ?
  `;

  const testsSql = `
    SELECT testId, TotalMarks, SubjectName FROM tests WHERE TestName = ?
  `;

  db.all(studentSql, [ClassName, stdRollNo], (err, studentRows) => {
    if (err) {
      console.error("Error fetching student data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data" });
    } else {
      const studentData = studentRows;

      db.all(testsSql, [TestName], (err, testsRows) => {
        if (err) {
          console.error("Error fetching tests data:", err);
          return res
            .status(500)
            .json({ error: "An error occurred while fetching data" });
        } else {
          const testsData = testsRows;

          // Now that you have the data, you can run the update query.
          if (studentData.length > 0 && testsData.length > 0) {
            const fullName = studentData[0].fullName;
            const testId = testsData[0].testId;
            const SubjectName = testsData[0].SubjectName;
            const TotalMarks = testsData[0].TotalMarks;
            if (ObtainedMarks > TotalMarks) {
              res.status(400).json({
                success: false,
                message: "Obtained marks can never be greater than Total marks",
              });
              return;
            }
            db.run(
              "UPDATE result SET fullName=?, stdRollNo=?, TestName=?, TotalMarks=?, SubjectName=?, ObtainedMarks=?, ClassName=?, stdTestPercentage=? WHERE resultId=?",
              [
                fullName,
                stdRollNo,
                TestName,
                TotalMarks,
                SubjectName,
                ObtainedMarks,
                ClassName,
                stdTestPercentage,
                resultId,
              ],
              (err) => {
                if (err) {
                  console.error("Error updating result:", err);
                  res.status(500).json({
                    success: false,
                    message: "Internal server error",
                  });
                } else {
                  res.json({
                    success: true,
                    message: "Result updated successfully",
                  });
                }
              }
            );
          } else {
            res
              .status(404)
              .json({ success: false, message: "Student or test not found" });
          }
        }
      });
    }
  });
});
// delete result
router.delete("/api/results/:resultId", verifyToken, (req, res) => {
  const resultId = req.params.resultId;

  db.get("SELECT * FROM result WHERE resultId = ?", [resultId], (err, row) => {
    if (err) {
      console.error("Error checking result existence:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else if (!row) {
      res.status(404).json({ success: false, message: "result not found" });
    } else {
      // Delete the test from the database
      db.run("DELETE FROM result WHERE resultId = ?", [resultId], (err) => {
        if (err) {
          console.error("Error deleting result:", err);
          res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        } else {
          res.json({
            success: true,
            message: "result deleted successfully",
          });
        }
      });
    }
  });
});

// Download Result PDF
router.get("/api/results/download/pdf/:stdRollNo", verifyToken, (req, res) => {
  const stdRollNo = req.params.stdRollNo;
  const pdf = new PDFDocument();
  const filename = `${stdRollNo}_results.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  pdf.pipe(res);

  db.all(
    "SELECT fullName, stdRollNo, TestName, TotalMarks, SubjectName, ClassName, ObtainedMarks FROM result WHERE stdRollNo = ?",
    [stdRollNo],
    (err, results) => {
      if (err) {
        console.error("Error fetching user results:", err);
        pdf.end();
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else {
        // Loop through the results and add them to the PDF document
        results.forEach((result) => {
          pdf.text(`Roll No: ${result.stdRollNo}`);
          pdf.text(`Full Name: ${result.fullName}`);
          pdf.text(`Test Name: ${result.TestName}`);
          pdf.text(`Subject Name: ${result.SubjectName}`);
          pdf.text(`Class Name: ${result.ClassName}`);
          pdf.text(`Obtained Marks: ${result.ObtainedMarks}`);
          pdf.text(`Total Marks: ${result.TotalMarks}`);
          pdf.moveDown(1); // Move down to the next line
        });
        pdf.end();
      }
    }
  );
});
module.exports = router;
