const express = require("express");
const router = express.Router();
const db = require("../db/Sqlite").db;
const crypto = require("crypto"); // Import the crypto module
const { verifyToken } = require("./authMiddleware");
const PDFDocument = require("pdfkit");

// Search and get all data from the database with filtering and sorting
router.post("/api/results/search", verifyToken, (req, res) => {
  const { searchText, selectedFilter, sortColumn, sortOrder } = req.body;
  const page = parseInt(req.body.page) || 1;
  const pageSize = parseInt(req.body.pageSize) || 5;
  const offset = (page - 1) * pageSize;

  let query = `
    SELECT resultId, fullName, stdRollNo, TestName, TotalMarks, SubjectName, ClassName, ObtainedMarks, Batch
    FROM result
    WHERE 1=1`;

  const params = [];

  if (
    selectedFilter === "fullName" ||
    selectedFilter === "stdRollNo" ||
    selectedFilter === "TestName" ||
    selectedFilter === "TotalMarks" ||
    selectedFilter === "SubjectName" ||
    selectedFilter === "ClassName" ||
    selectedFilter === "ObtainedMarks" ||
    selectedFilter === "Batch"
  ) {
    query += ` AND ${selectedFilter} LIKE ?`;
    params.push(`%${searchText}%`);
  } else {
    query += ` AND (fullName LIKE ? OR stdRollNo LIKE ? OR TestName LIKE ? OR TotalMarks LIKE ? OR SubjectName LIKE ? OR ClassName LIKE ? OR ObtainedMarks LIKE ? OR Batch LIKE ?)`;
    params.push(
      `%${searchText}%`,
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
            SELECT resultId, fullName, stdRollNo, TestName, TotalMarks, SubjectName, ClassName, ObtainedMarks, Batch
            FROM result 
            WHERE 1=1`;

  const params = [];

  if (
    filter === "stdRollNo" ||
    filter === "fullName" ||
    filter === "TestName" ||
    filter === "TotalMarks" ||
    filter === "SubjectName" ||
    filter === "ClassName" ||
    filter === "ObtainedMarks" ||
    filter === "Batch"
  ) {
    query += ` AND ${filter} LIKE ?`;
    params.push(`%${search}%`);
  } else if (filter === "all") {
    query += ` AND (fullName LIKE ? OR stdRollNo LIKE ? OR TestName LIKE ? OR TotalMarks LIKE ? OR SubjectName LIKE ? OR ClassName LIKE ? OR ObtainedMarks LIKE ? OR Batch LIKE ?)`;
    params.push(
      `%${search}%`,
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

router.post("/api/results", verifyToken, (req, res) => {
  const { stdRollNo, TestName, ObtainedMarks } = req.body;

  if (!stdRollNo || !TestName || !ObtainedMarks) {
    return res.status(400).json({ error: "All Fields are required." });
  }

  db.get(
    "SELECT COUNT(*) as count FROM result WHERE stdRollNo = ? AND TestName = ?",
    [stdRollNo, TestName],
    (err, result) => {
      if (err) {
        console.error("Error checking if record exists:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const recordCount = result.count;
      if (recordCount > 0) {
        return res.status(409).json({ error: "Record already exists." });
      }

      db.get(
        "SELECT testId, TotalMarks, SubjectName, ClassName FROM tests WHERE TestName = ?",
        [TestName],
        (err, testRow) => {
          if (err) {
            console.error("Error checking if test exists:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          if (!testRow) {
            return res.status(404).json({ error: "Test not found." });
          }

          const { testId, TotalMarks, SubjectName, ClassName } = testRow;

          db.get(
            "SELECT studentId, Batch, fullName FROM students WHERE stdRollNo = ?",
            [stdRollNo],
            (err, studentRow) => {
              if (err) {
                console.error("Error checking if student exists:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }

              if (!studentRow) {
                return res.status(404).json({ error: "Student not found." });
              }

              const { studentId, Batch, fullName } = studentRow;

              const resultId = crypto.randomUUID(); // Generate a random UUID

              db.run(
                "INSERT INTO result (resultId, fullName, stdRollNo, TestName, ObtainedMarks, Batch, studentId, testId, TotalMarks, SubjectName, ClassName) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                  resultId,
                  fullName,
                  stdRollNo,
                  TestName,
                  ObtainedMarks,
                  Batch,
                  studentId,
                  testId,
                  TotalMarks,
                  SubjectName,
                  ClassName,
                ],
                (err) => {
                  if (err) {
                    console.error(
                      "Error inserting data into result table:",
                      err
                    );
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
router.put("/api/results/:testId", verifyToken, (req, res) => {
  const resultId = req.params.testId;
  const {
    fullName,
    stdRollNo,
    TestName,
    TotalMarks,
    SubjectName,
    ClassName,
    ObtainedMarks,
    Batch,
  } = req.body;

  if (
    !fullName ||
    !stdRollNo ||
    !ObtainedMarks ||
    !Batch ||
    !TestName ||
    !SubjectName ||
    !TotalMarks ||
    !ClassName
  ) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }
  db.get("SELECT * FROM result WHERE resultId = ?", [resultId], (err, row) => {
    if (err) {
      console.error("Error checking test existence:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else if (!row) {
      res.status(404).json({ success: false, message: "result not found" });
    } else {
      if (
        fullName === row.fullName &&
        stdRollNo === row.stdRollNo &&
        TestName === row.TestName &&
        ObtainedMarks === row.ObtainedMarks &&
        SubjectName === row.SubjectName &&
        Batch === row.Batch &&
        TotalMarks === row.TotalMarks &&
        ClassName === row.ClassName
      ) {
        res.status(400).json({
          success: false,
          message: "No changes detected. result data remains the same",
        });
      } else {
        db.run(
          "UPDATE result SET fullName=?, stdRollNo=?, TestName=?, TotalMarks=?, SubjectName=?, ObtainedMarks=?, Batch=?, ClassName=? WHERE resultId=?",
          [
            fullName,
            stdRollNo,
            TestName,
            TotalMarks,
            SubjectName,
            ObtainedMarks,
            Batch,
            ClassName,
            resultId,
          ],
          (err) => {
            if (err) {
              console.error("Error updating test:", err);
              res
                .status(500)
                .json({ success: false, message: "Internal server error" });
            } else {
              res.json({
                success: true,
                message: "result updated successfully",
              });
            }
          }
        );
      }
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
    "SELECT fullName, stdRollNo, TestName, TotalMarks, SubjectName, ClassName, ObtainedMarks, Batch FROM result WHERE stdRollNo = ?",
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
          pdf.text(`Batch: ${result.Batch}`);
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
