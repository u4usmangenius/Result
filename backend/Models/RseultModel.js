const express = require("express");
const router = express.Router();
const db = require("../db/Sqlite").db;
const crypto = require("crypto"); // Import the crypto module

router.post("/api/results", (req, res) => {
  const { userName, TestName, ObtainedMarks } = req.body;

  // Check if userName, TestName, and ObtainedMarks are provided in the request body
  if (!userName || !TestName || !ObtainedMarks) {
    return res.status(400).json({ error: "All Fields are required." });
  }

  // Check if a record with the same userName and TestName already exists in the result table
  db.get(
    "SELECT COUNT(*) as count FROM result WHERE userName = ? AND TestName = ?",
    [userName, TestName],
    (err, result) => {
      if (err) {
        console.error("Error checking if record exists:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const recordCount = result.count;
      if (recordCount > 0) {
        return res.status(409).json({ error: "Record already exists." });
      }

      // Check if the test with the provided TestName exists in the tests table
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

          // Check if the student with the provided userName exists in the students table
          db.get(
            "SELECT studentId, Batch, fullName FROM students WHERE userName = ?",
            [userName],
            (err, studentRow) => {
              if (err) {
                console.error("Error checking if student exists:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }

              if (!studentRow) {
                return res.status(404).json({ error: "Student not found." });
              }

              const { studentId, Batch, fullName } = studentRow;

              // Insert data into the result table
              const resultId = crypto.randomUUID(); // Generate a random UUID

              db.run(
                "INSERT INTO result (resultId, fullName, userName, TestName, ObtainedMarks, Batch, studentId, testId, TotalMarks, SubjectName, ClassName) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                  resultId,
                  fullName,
                  userName,
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

// get result data
router.get("/api/results", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const filter = req.query.filter || "";
  const search = req.query.search || "";
  const offset = (page - 1) * pageSize;

  let query = `
            SELECT resultId, fullName, userName, TestName, TotalMarks,SubjectName, ClassName,ObtainedMarks ,Batch
            FROM result 
            WHERE 1=1`;

  const params = [];

  if (
    filter === "userName" ||
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
    query += ` AND (fullName LIKE ? OR userName LIKE ?  OR TestName LIKE ? OR TotalMarks LIKE ? OR SubjectName LIKE ? OR ClassName LIKE ? OR ObtainedMarks LIKE ? OR Batch LIKE ?)`;
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

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error getting result:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      const totalCount = rows.length; // Use the filtered row count
      const totalPages = Math.ceil(totalCount / pageSize);

      // Calculate the slice of results for the current page
      const startIndex = offset;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      const pageResults = rows.slice(startIndex, endIndex);

      res.json({ success: true, results: pageResults, totalPages });
    }
  });
});
// Update Result Api
router.put("/api/results/:testId", (req, res) => {
  const resultId = req.params.testId;
  const {
    fullName,
    userName,
    TestName,
    TotalMarks,
    SubjectName,
    ClassName,
    ObtainedMarks,
    Batch,
  } = req.body;

  // Check if any required field is missing
  if (
    !fullName ||
    !userName ||
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
  // Check if the result with the specified ID exists
  db.get("SELECT * FROM result WHERE resultId = ?", [resultId], (err, row) => {
    if (err) {
      console.error("Error checking test existence:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else if (!row) {
      res.status(404).json({ success: false, message: "result not found" });
    } else {
      // Check if the new data is different from the existing data
      if (
        fullName === row.fullName &&
        userName === row.userName &&
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
        // Update the test's information (excluding password)
        db.run(
          "UPDATE result SET fullName=?, userName=?, TestName=?, TotalMarks=?, SubjectName=?, ObtainedMarks=?, Batch=?, ClassName=? WHERE resultId=?",
          [
            fullName,
            userName,
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
router.delete("/api/results/:resultId", (req, res) => {
  const resultId = req.params.resultId;

  // Check if the test with the specified ID exists
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

module.exports = router;
