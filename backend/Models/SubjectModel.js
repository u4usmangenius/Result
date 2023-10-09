const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { verifyToken } = require("./authMiddleware");
const db = require("../db/Sqlite").db;
// search data api
// Router to search and paginate subjects with validations
router.post("/api/subjects/search", verifyToken, (req, res) => {
  const { searchText, selectedFilter, sortColumn, sortOrder } = req.body;
  const page = parseInt(req.body.page) || 1;
  const pageSize = parseInt(req.body.pageSize) || 10;
  const filter = req.body.filter || "";
  const search = req.body.search || "";
  const offset = (page - 1) * pageSize;

  let query = `
    SELECT subjectId, subjectName, courseCode
    FROM subjects
    WHERE 1=1`;

  const params = [];
  if (selectedFilter === "subjectName" || selectedFilter === "courseCode") {
    query += ` AND ${selectedFilter} LIKE ?`;
    params.push(`%${searchText}%`);
  } else {
    query += ` AND (subjectName LIKE ? OR courseCode LIKE ?)`;
    params.push(`%${searchText}%`, `%${searchText}%`);
  }

  // Add sorting to the query if sortColumn and sortOrder are provided
  if (sortColumn && sortOrder) {
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error searching and sorting subjects:", err);
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

          // Calculate the slice of results for the current page
          const startIndex = offset;
          const endIndex = Math.min(startIndex + pageSize, rows.length);
          const pageResults = rows.slice(startIndex, endIndex);

          res.json({
            success: true,
            subjects: pageResults,
            totalPages,
            sortColumn,
            sortOrder,
          });
        }
      });
    }
  });
});
// Router to get paginated subjects with validations
router.post("/api/subject", verifyToken, (req, res) => {
  const page = parseInt(req.body.page) || 1;
  const pageSize = parseInt(req.body.pageSize) || 10;
  const filter = req.body.filter || "";
  const search = req.body.search || "";
  const sortColumn = req.body.sortColumn || "subjectName"; // Default sorting column
  const sortOrder = req.body.sortOrder || "asc"; // Default sorting order (ascending)
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
    // Handle global search
    query += ` AND (subjectName LIKE ? OR courseCode LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  // Add sorting to the query
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;

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

          // Calculate the slice of results for the current page
          const startIndex = offset;
          const endIndex = Math.min(startIndex + pageSize, rows.length);
          const pageResults = rows.slice(startIndex, endIndex);

          res.json({
            success: true,
            subjects: pageResults,
            totalPages,
            sortColumn,
            sortOrder,
          });
        }
      });
    }
  });
});

// get all subjects for showing in drop down in teachers and students without pagination
router.get("/api/subjects", verifyToken, (req, res) => {
  const query = `
    SELECT subjectId, subjectName, courseCode
    FROM subjects`;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Error getting subjects:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      res.json({ success: true, subjects: rows });
    }
  });
});

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
