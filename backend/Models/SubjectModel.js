const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { verifyToken } = require("./authMiddleware");
const db = require("../db/Sqlite").db;
// add subject
router.post("/api/subjects", verifyToken, (req, res) => {
  const { subjectName, courseCode } = req.body;

  // Check if any required field is missing
  if (!subjectName || !courseCode) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }

  // Check if a subject with the same subjectName or courseCode already exists
  db.get(
    "SELECT * FROM subjects WHERE subjectName = ? OR courseCode = ?",
    [subjectName, courseCode],
    (err, row) => {
      if (err) {
        console.error("Error checking subject existence:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else if (row) {
        // A subject with the same name or course code already exists
        res.status(400).json({
          success: false,
          message: "A subject with the same name or course code already exists",
        });
      } else {
        // Insert the new subject
        const subjectId = crypto.randomUUID();
        db.run(
          "INSERT INTO subjects (subjectId, subjectName, courseCode) VALUES (?, ?, ?)",
          [subjectId, subjectName, courseCode],
          (err) => {
            if (err) {
              console.error("Error inserting subject:", err);
              res
                .status(500)
                .json({ success: false, message: "Internal server error" });
            } else {
              res.json({
                success: true,
                message: "Subject inserted successfully",
              });
            }
          }
        );
      }
    }
  );
});
// get subject // Route to get paginated subjects with validations
router.get("/api/subjects", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5; // Get the pageSize query parameter
  const filter = req.query.filter || ""; // Get the filter query parameter
  const search = req.query.search || ""; // Get the search query parameter

  const offset = (page - 1) * pageSize;

  let query = `
    SELECT subjectId, subjectName, courseCode 
    FROM subjects
    WHERE 1=1`;

  const params = [];

  if (filter === "subjectName" || filter === "courseCode") {
    query += ` AND ${filter} LIKE ?`;
    params.push(`%${search}%`);
  } else if (filter === "all") {
    query += ` AND (subjectName LIKE ? OR courseCode LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ` LIMIT ? OFFSET ?`; // Add LIMIT and OFFSET clauses
  params.push(pageSize, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error getting subjects:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      db.get("SELECT COUNT(*) as count FROM subjects", (err, row) => {
        if (err) {
          console.error("Error getting subject count:", err);
          res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        } else {
          const totalCount = row.count;
          const totalPages = Math.ceil(totalCount / pageSize);

          res.json({
            success: true,
            subjects: rows,
            totalPages,
            rowsPerPage: pageSize,
          }); // Include rowsPerPage in the response
        }
      });
    }
  });
});
// update subject
router.put("/api/subjects/:subjectId", verifyToken, (req, res) => {
  const subjectId = req.params.subjectId;
  const { subjectName, courseCode } = req.body;

  // Check if any required field is missing
  if (!subjectName || !courseCode) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }

  // Check if the subject with the specified ID exists
  db.get(
    "SELECT * FROM subjects WHERE subjectId = ?",
    [subjectId],
    (err, row) => {
      if (err) {
        console.error("Error checking subject existence:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else if (!row) {
        res.status(404).json({ success: false, message: "subject not found" });
      } else {
        // Check if the new data is different from the existing data
        if (subjectName === row.subjectName && courseCode === row.courseCode) {
          res.status(400).json({
            success: false,
            message: "No changes detected. subject data remains the same",
          });
        } else {
          // Update the subject's information (excluding password)
          db.run(
            "UPDATE subjects SET subjectName=?, courseCode=? WHERE subjectId=?",
            [subjectName, courseCode, subjectId],
            (err) => {
              if (err) {
                console.error("Error updating subject:", err);
                res
                  .status(500)
                  .json({ success: false, message: "Internal server error" });
              } else {
                res.json({
                  success: true,
                  message: "subject updated successfully",
                });
              }
            }
          );
        }
      }
    }
  );
});
// Route to delete a subject by ID
router.delete("/api/subjects/:subjectId", verifyToken, (req, res) => {
  const subjectId = req.params.subjectId;

  // Check if the subject with the specified ID exists
  db.get(
    "SELECT * FROM subjects WHERE subjectId = ?",
    [subjectId],
    (err, row) => {
      if (err) {
        console.error("Error checking subject existence:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else if (!row) {
        res.status(404).json({ success: false, message: "subject not found" });
      } else {
        // Delete the subject from the database
        db.run(
          "DELETE FROM subjects WHERE subjectId = ?",
          [subjectId],
          (err) => {
            if (err) {
              console.error("Error deleting subject:", err);
              res
                .status(500)
                .json({ success: false, message: "Internal server error" });
            } else {
              res.json({
                success: true,
                message: "subject deleted successfully",
              });
            }
          }
        );
      }
    }
  );
});

module.exports = router;
