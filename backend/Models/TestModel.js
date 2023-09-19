const express = require("express");
const router = express.Router();
const db = require("../db/Sqlite").db;
const crypto = require("crypto"); // Import the crypto module
const { verifyToken } = require("./authMiddleware");

// Adding a test
router.post("/api/tests", verifyToken, (req, res) => {
  const { SubjectName, TestName, TotalMarks, ClassName } = req.body;

  // Check if SubjectName and userSubject are provided in the request body
  if (!SubjectName || !TestName || !TotalMarks || !ClassName) {
    return res.status(400).json({ error: "All Fields are required." });
  }

  // Perform a lookup in the test table to check if the record already exists
  db.get(
    "SELECT COUNT(*) as count FROM tests WHERE SubjectName = ? AND TestName = ? AND ClassName = ? AND TotalMarks = ?",
    [SubjectName, TestName, ClassName, TotalMarks],
    (err, result) => {
      if (err) {
        console.error("Error checking if record exists:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const recordCount = result.count;
      if (recordCount > 0) {
        return res.status(409).json({ error: "Record already exists." });
      }

      const testId = crypto.randomUUID(); // Generate a random UUID

      db.get(
        "SELECT studentId FROM students WHERE ClassName = ?",
        [ClassName],
        (err, studentRow) => {
          if (err) {
            console.error("Error fetching studentId:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          db.get(
            "SELECT subjectId FROM subjects WHERE SubjectName = ?",
            [SubjectName],
            (err, subjectRow) => {
              if (err) {
                console.error("Error fetching subjectId:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }

              if (!studentRow || !subjectRow) {
                return res
                  .status(404)
                  .json({ error: "Student or subject not found." });
              }

              const studentId = studentRow.studentId;
              const subjectId = subjectRow.subjectId;

              // Insert data into the test table with the generated testId
              db.run(
                "INSERT INTO tests (testId, studentId, subjectId, SubjectName, TestName, TotalMarks, ClassName) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                  testId,
                  studentId,
                  subjectId,
                  SubjectName,
                  TestName,
                  TotalMarks,
                  ClassName,
                ],
                (err) => {
                  if (err) {
                    console.error("Error inserting data into test table:", err);
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

// getting data from test
router.get("/api/tests", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const filter = req.query.filter || ""; // Get the filter query parameter
  const search = req.query.search || ""; // Get the search query parameter

  const offset = (page - 1) * pageSize;

  let query = `
        SELECT testId, TestName, SubjectName, TotalMarks, ClassName 
        FROM tests 
        WHERE 1=1`;

  const params = [];
  if (
    filter === "TestName" ||
    filter === "SubjectName" ||
    filter === "TotalMarks" ||
    filter === "ClassName"
  ) {
    query += ` AND ${filter} LIKE ?`;
    params.push(`%${search}%`);
  } else if (filter === "all") {
    // Handle global search
    query += ` AND (TestName LIKE ?  OR SubjectName LIKE ? OR TotalMarks LIKE ? OR ClassName LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  // Do not limit the query, retrieve all matching records
  // query += ` LIMIT ? OFFSET ?`;
  // params.push(pageSize, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error getting tests:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      db.get("SELECT COUNT(*) as count FROM tests", (err, row) => {
        if (err) {
          console.error("Error getting test count:", err);
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

          res.json({ success: true, tests: pageResults, totalPages });
        }
      });
    }
  });
});
// updated tests
router.put("/api/tests/:testId", verifyToken, (req, res) => {
  const testId = req.params.testId;
  const { TestName, SubjectName, TotalMarks, ClassName } = req.body;

  // Check if any required field is missing
  if (!TestName || !SubjectName || !TotalMarks || !ClassName) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }

  // Check if the test with the specified ID exists
  db.get("SELECT * FROM tests WHERE testId = ?", [testId], (err, row) => {
    if (err) {
      console.error("Error checking test existence:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else if (!row) {
      res.status(404).json({ success: false, message: "test not found" });
    } else {
      // Check if the new data is different from the existing data
      if (
        TestName === row.TestName &&
        SubjectName === row.SubjectName &&
        TotalMarks === row.TotalMarks &&
        ClassName === row.ClassName
      ) {
        res.status(400).json({
          success: false,
          message: "No changes detected. test data remains the same",
        });
      } else {
        // Update the test's information (excluding password)
        db.run(
          "UPDATE tests SET TestName=?, SubjectName=?, TotalMarks=?, ClassName=? WHERE testId=?",
          [TestName, SubjectName, TotalMarks, ClassName, testId],
          (err) => {
            if (err) {
              console.error("Error updating test:", err);
              res
                .status(500)
                .json({ success: false, message: "Internal server error" });
            } else {
              res.json({
                success: true,
                message: "test updated successfully",
              });
            }
          }
        );
      }
    }
  });
});
// Route to delete a test by ID
router.delete("/api/tests/:testId",verifyToken, (req, res) => {
  const testId = req.params.testId;

  // Check if the test with the specified ID exists
  db.get("SELECT * FROM tests WHERE testId = ?", [testId], (err, row) => {
    if (err) {
      console.error("Error checking test existence:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else if (!row) {
      res.status(404).json({ success: false, message: "test not found" });
    } else {
      // Delete the test from the database
      db.run("DELETE FROM tests WHERE testId = ?", [testId], (err) => {
        if (err) {
          console.error("Error deleting test:", err);
          res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        } else {
          res.json({
            success: true,
            message: "test deleted successfully",
          });
        }
      });
    }
  });
});

module.exports = router;
