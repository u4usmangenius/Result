const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db/Sqlite").db;
const { verifyToken } = require("./authMiddleware");
router.post("/api/students", verifyToken, (req, res) => {
  const {
    fullName,
    className,
    stdRollNo,
    gender,
    stdPhone,
    guard_Phone,
    Batch,
  } = req.body;

  // Check if any required field is missing
  if (
    !fullName ||
    !className ||
    !gender ||
    !stdRollNo ||
    !stdPhone ||
    !guard_Phone ||
    !Batch
  ) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }

  const studentId = crypto.randomUUID();
  db.run(
    "INSERT INTO students (studentId, fullName, className, stdRollNo, gender, stdPhone,guard_Phone,  Batch) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
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
    (err) => {
      if (err) {
        console.error("Error inserting Student:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else {
        res.json({ success: true, message: "Student Inserted successfully" });
      }
    }
  );
});

// Router to get paginated students with validations
router.get("/api/students", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const filter = req.query.filter || "";
  const search = req.query.search || "";
  const offset = (page - 1) * pageSize;

  let query = `
        SELECT studentId, fullName, className, stdRollNo, gender,stdPhone,guard_Phone ,Batch
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
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error getting students:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
        if (err) {
          console.error("Error getting student count:", err);
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

          res.json({ success: true, students: pageResults, totalPages });
        }
      });
    }
  });
});
// upload multiple students using csv
router.post("/api/students/upload-csv", verifyToken, (req, res) => {
  const { csvData } = req.body;

  // Check if the required CSV data is provided
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    res.status(400).json({ success: false, message: "Invalid CSV data" });
    return;
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
        "INSERT INTO students (studentId, fullName, className, stdRollNo, gender, stdPhone,guardPhone,Batch) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
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
            console.error("Error inserting student:", err);
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
        console.error("Error checking student existence:", err);
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
                console.error("Error updating student:", err);
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
        console.error("Error checking student existence:", err);
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
              console.error("Error deleting student:", err);
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
