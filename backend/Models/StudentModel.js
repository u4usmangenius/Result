const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db/Sqlite").db;
const { verifyToken } = require("./authMiddleware");
const {
  checkStudentSubjectExists,
  fetchSubjectId,
  insertStudentSubject,
} = require("./StudentHelper");
// searching data api
router.post("/api/students/search", verifyToken, (req, res) => {
  const { searchText, selectedFilter, sortColumn, sortOrder } = req.body;
  let query = `
      SELECT studentId, fullName, className, stdRollNo, gender, stdPhone, guard_Phone, Batch 
      FROM students 
      WHERE 1=1`;

  const params = [];

  if (
    selectedFilter === "fullName" ||
    selectedFilter === "stdRollNo" ||
    selectedFilter === "className" ||
    selectedFilter === "gender" ||
    selectedFilter === "Batch" ||
    selectedFilter === "guard_Phone" ||
    selectedFilter === "stdPhone"
  ) {
    query += ` AND ${selectedFilter} LIKE ?`;
    params.push(`%${searchText}%`);
  } else {
    query += ` AND (fullName LIKE ? OR className LIKE ? OR stdRollNo LIKE ? OR gender LIKE ? OR stdPhone LIKE ? OR guard_Phone LIKE ? OR Batch LIKE ?)`;
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
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      res.json({ success: true, students: rows });
    }
  });
});

// Router to get paginated students with validations
router.post("/api/student", verifyToken, (req, res) => {
  const page = parseInt(req.body.page) || 1;
  const pageSize = parseInt(req.body.pageSize) || 5;
  const filter = req.body.filter || "";
  const search = req.body.search || "";
  const sortColumn = req.body.sortColumn || "fullName"; // Default sorting column
  const sortOrder = req.body.sortOrder || "asc"; // Default sorting order (ascending)
  const offset = (page - 1) * pageSize;

  let query = `
        SELECT studentId, fullName, className, stdRollNo, gender, stdPhone, guard_Phone, Batch
        FROM students 
        WHERE 1=1`;

  const params = [];
  if (
    filter === "fullName" ||
    filter === "stdRollNo" ||
    filter === "className" ||
    filter === "gender" ||
    filter === "Batch" ||
    filter === "guard_Phone" ||
    filter === "stdPhone"
  ) {
    query += ` AND ${filter} LIKE ?`;
    params.push(`%${search}%`);
  } else if (filter === "all") {
    // Handle global search
    query += ` AND (fullName LIKE ? OR className LIKE ? OR stdRollNo LIKE ? OR gender LIKE ? OR stdPhone LIKE ? OR guard_Phone LIKE ? OR Batch LIKE ?)`;
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
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
        if (err) {
          res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        } else {
          const totalCount = row.count;
          const totalPages = Math.ceil(totalCount / pageSize);

          // Calculate the slice of results for the current page
          const startIndex = offset;
          const endIndex = Math.min(startIndex + pageSize, rows.length);
          const pageResults = rows.slice(startIndex, endIndex);

          res.json({
            success: true,
            students: pageResults,
            totalPages,
            sortColumn,
            sortOrder,
          });
        }
      });
    }
  });
});

// add students with subjects in subject table
router.post("/api/students", verifyToken, async (req, res) => {
  const {
    fullName,
    className,
    stdRollNo,
    gender,
    stdPhone,
    guard_Phone,
    Batch,
    subjects, // Assuming subjects is an array of subject names
  } = req.body;

  // Check if any required field is missing
  if (
    !fullName ||
    !className ||
    !gender ||
    !stdRollNo ||
    !Batch ||
    !subjects ||
    subjects.length !== 6 // Ensure there are exactly 6 subjects
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request data" });
  }
  // Generate a UUID for studentId

  const studentExistsQuery =
    "SELECT COUNT(*) as count FROM students WHERE stdRollNo = ? AND className = ?";
  db.get(studentExistsQuery, [stdRollNo, className], async (err, result) => {
    if (err) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      const studentCount = result.count;

      if (studentCount > 0) {
        return res.status(409).json({
          success: false,
          message: `Student with the same roll number already exists in class ${className}`,
        });
      } else {
        // Continue with the insertion process
        const studentId = crypto.randomUUID();

        // Insert student information into the students table
        db.run(
          "INSERT INTO students (studentId, fullName, className, stdRollNo, gender, stdPhone, guard_Phone, Batch) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            studentId,
            fullName,
            className,
            stdRollNo,
            gender,
            stdPhone,
            guard_Phone,
            Batch,
          ],
          async (err) => {
            if (err) {
              res.status(500).json({
                success: false,
                message: "Internal herererer server error",
              });
            } else {
              try {
                // Insert subjects into the student_subject table for this student
                for (const subjectName of subjects) {
                  // Check if the same roll number and subject already exist in student_subject
                  const studentSubjectCount = await checkStudentSubjectExists(
                    stdRollNo,
                    subjectName
                  );

                  if (studentSubjectCount === 0) {
                    const std_subjectId = crypto.randomUUID();

                    // Fetch subjectId from the subjects table
                    const subjectRow = await fetchSubjectId(subjectName);

                    if (subjectRow) {
                      const subjectId = subjectRow.subjectId;

                      // Insert data into the student_subject table
                      await insertStudentSubject(
                        std_subjectId,
                        studentId,
                        subjectId,
                        stdRollNo,
                        subjectName
                      );
                    }
                  }
                }

                res.json({
                  success: true,
                  message: "Student and subjects inserted successfully",
                });
              } catch (error) {
                res
                  .status(500)
                  .json({ success: false, message: "Internal server error" });
              }
            }
          }
        );
      }
    }
  });
}); // upload multiple students using csv
router.post("/api/students/upload-csv", verifyToken, (req, res) => {
  const { csvData } = req.body;

  // Check if the required CSV data is provided
  if (!csvData.fullName) {
    console.log("nahi full name mila gaya", csvData.fullName);
  }

  if (!Array.isArray(csvData) || csvData.length === 0) {
    res.status(400).json({ success: false, message: "Invalid CSV data" });
    console.log("nahi mila 1st");
    return;
  }
  for (const data of csvData) {
    // Check if required properties exist in each object
    if (
      !data.fullName ||
      !data.stdRollNo ||
      !data.className ||
      !data.gender ||
      !data.guard_Phone ||
      !data.Batch ||
      !data.stdPhone ||
      !data.Subject1 ||
      !data.Subject2 ||
      !data.Subject3 ||
      !data.Subject4 ||
      !data.Subject5 ||
      !data.Subject6
    ) {
      res.status(400).json({ success: false, message: "Invalid CSV data" });
      console.log("nahi mila 2nd a&&&&&&&&&&&&&&& always");
      return;
    }
  }

  // Assuming your CSV columns match the student data fields
  const studentsToAdd = csvData.map((row) => ({
    fullName: row.fullName,
    className: row.className,
    Batch: row.Batch,
    gender: row.gender,
    stdPhone: row.stdPhone,
    stdRollNo: row.stdRollNo,
    guard_Phone: row.guard_Phone,
  }));

  // Now, you can add the multiple students to the database
  const studentInsertPromises = studentsToAdd.map((student) => {
    return new Promise((resolve, reject) => {
      const studentId = crypto.randomUUID();
      db.run(
        "INSERT INTO students (studentId, fullName, className, stdRollNo, gender, stdPhone,guard_Phone,Batch) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
        [
          studentId,
          student.fullName,
          student.className,
          student.stdRollNo,
          student.gender,
          student.stdPhone,
          student.guard_Phone,
          student.Batch,
        ],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  });

  Promise.all(studentInsertPromises)
    .then(() => {
      res.json({ success: true, message: "students inserted successfully" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    });
});

// create api for handling multiple data from frontend in array (csv)
// Route to update a student by ID (excluding password)
router.put("/api/students/:studentId", verifyToken, (req, res) => {
  const studentId = req.params.studentId;
  const {
    fullName,
    className,
    stdRollNo,
    gender,
    stdPhone,
    Batch,
    guard_Phone,
  } = req.body;

  // Check if any required field is missing
  if (
    !fullName ||
    !className ||
    !gender ||
    !stdRollNo ||
    !stdPhone ||
    !Batch ||
    !guard_Phone
  ) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }

  // Check if the student with the specified ID exists
  db.get(
    "SELECT * FROM students WHERE studentId = ?",
    [studentId],
    (err, row) => {
      if (err) {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else if (!row) {
        res.status(404).json({ success: false, message: "student not found" });
      } else {
        // Check if the new data is different from the existing data
        if (
          fullName === row.fullName &&
          className === row.subject &&
          stdRollNo === row.stdRollNo &&
          gender === row.gender &&
          Batch === row.gender &&
          guard_Phone === row.guard_Phone &&
          stdPhone === row.stdPhone
        ) {
          res.status(400).json({
            success: false,
            message: "No changes detected. student data remains the same",
          });
        } else {
          // Update the student's information (excluding password)
          db.run(
            "UPDATE students SET fullName=?, className=?, stdRollNo=?, gender=?,stdPhone=?, guard_Phone=?, Batch=? WHERE studentId=?",
            [
              fullName,
              className,
              stdRollNo,
              gender,
              stdPhone,
              guard_Phone,
              Batch,
              studentId,
            ],
            (err) => {
              if (err) {
                res
                  .status(500)
                  .json({ success: false, message: "Internal server error" });
              } else {
                res.json({
                  success: true,
                  message: "student updated successfully",
                });
              }
            }
          );
        }
      }
    }
  );
});
// Route to delete a student by ID
router.delete("/api/students/:studentId", verifyToken, (req, res) => {
  const studentId = req.params.studentId;

  // Check if the student with the specified ID exists
  db.get(
    "SELECT * FROM students WHERE studentId = ?",
    [studentId],
    (err, row) => {
      if (err) {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else if (!row) {
        res.status(404).json({ success: false, message: "student not found" });
      } else {
        // Delete the student from the database
        db.run(
          "DELETE FROM students WHERE studentId = ?",
          [studentId],
          (err) => {
            if (err) {
              res
                .status(500)
                .json({ success: false, message: "Internal server error" });
            } else {
              res.json({
                success: true,
                message: "student deleted successfully",
              });
            }
          }
        );
      }
    }
  );
});

module.exports = router;
