const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db/Sqlite").db;
const { verifyToken } = require("./authMiddleware");
// Route to search for teachers across all data in the database
router.post("/api/teachers/search", verifyToken, (req, res) => {
  const { searchText, selectedFilter, sortColumn, sortOrder } = req.body; // Include sortColumn and sortOrder

  let query = `
      SELECT teacherId, fullName, subject, gender, phone 
      FROM teachers 
      WHERE 1=1`;

  const params = [];

  if (
    selectedFilter === "fullName" ||
    selectedFilter === "subject" ||
    selectedFilter === "gender" ||
    selectedFilter === "phone"
  ) {
    query += ` AND ${selectedFilter} LIKE ?`;
    params.push(`%${searchText}%`);
  } else {
    query += ` AND (fullName LIKE ? OR subject LIKE ? OR gender LIKE ? OR phone LIKE ?)`;
    params.push(
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
      console.error("Error searching and sorting teachers:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      res.json({ success: true, teachers: rows });
    }
  });
});
// Route to get paginated teachers with validations
router.post("/api/teacher", verifyToken, (req, res) => {
  const page = parseInt(req.body.page) || 1;
  const pageSize = parseInt(req.body.pageSize) || 5;
  const filter = req.body.filter || ""; // Get the filter query parameter
  const search = req.body.search || ""; // Get the search query parameter
  const sortColumn = req.body.sortColumn || "fullName"; // Default sorting column
  const sortOrder = req.body.sortOrder || "asc"; // Default sorting order (ascending)

  const offset = (page - 1) * pageSize;

  let query = `
      SELECT teacherId, fullName, subject, gender, phone 
      FROM teachers 
      WHERE 1=1`;

  const params = [];
  if (
    filter === "fullName" ||
    filter === "subject" ||
    filter === "gender" ||
    filter === "phone"
  ) {
    query += ` AND ${filter} LIKE ?`;
    params.push(`%${search}%`);
  } else if (filter === "all") {
    // Handle global search
    query += ` AND (fullName LIKE ? OR subject LIKE ? OR gender LIKE ? OR phone LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  // Add sorting to the query
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;

  // Do not limit the query, retrieve all matching records
  // query += ` LIMIT ? OFFSET ?`;
  // params.push(pageSize, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error getting teachers:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      db.get("SELECT COUNT(*) as count FROM teachers", (err, row) => {
        if (err) {
          console.error("Error getting teacher count:", err);
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
            teachers: pageResults,
            totalPages,
            sortColumn,
            sortOrder,
          });
        }
      });
    }
  });
});

// create api for handling multiple data from frontend in array (csv)
// Route to update a teacher by ID (excluding password)
router.put("/api/teachers/:teacherId", verifyToken, (req, res) => {
  const teacherId = req.params.teacherId;
  const { fullName, subject, gender, phone } = req.body;

  // Check if any required field is missing
  if (!fullName || !subject || !gender || !phone) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }

  // Check if the teacher with the specified ID exists
  db.get(
    "SELECT * FROM teachers WHERE teacherId = ?",
    [teacherId],
    (err, row) => {
      if (err) {
        console.error("Error checking teacher existence:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else if (!row) {
        res.status(404).json({ success: false, message: "Teacher not found" });
      } else {
        // Check if the new data is different from the existing data
        if (
          fullName === row.fullName &&
          subject === row.subject &&
          gender === row.gender &&
          phone === row.phone
        ) {
          res.status(400).json({
            success: false,
            message: "No changes detected. Teacher data remains the same",
          });
        } else {
          // Update the teacher's information (excluding password)
          db.run(
            "UPDATE teachers SET fullName=?, subject=?, gender=?, phone=? WHERE teacherId=?",
            [fullName, subject, gender, phone, teacherId],
            (err) => {
              if (err) {
                console.error("Error updating teacher:", err);
                res
                  .status(500)
                  .json({ success: false, message: "Internal server error" });
              } else {
                res.json({
                  success: true,
                  message: "Teacher updated successfully",
                });
              }
            }
          );
        }
      }
    }
  );
});
// Route to delete a teacher by ID
router.delete("/api/teachers/:teacherId", verifyToken, (req, res) => {
  const teacherId = req.params.teacherId;

  // Check if the teacher with the specified ID exists
  db.get(
    "SELECT * FROM teachers WHERE teacherId = ?",
    [teacherId],
    (err, row) => {
      if (err) {
        console.error("Error checking teacher existence:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else if (!row) {
        res.status(404).json({ success: false, message: "Teacher not found" });
      } else {
        // Delete the teacher from the database
        db.run(
          "DELETE FROM teachers WHERE teacherId = ?",
          [teacherId],
          (err) => {
            if (err) {
              console.error("Error deleting teacher:", err);
              res
                .status(500)
                .json({ success: false, message: "Internal server error" });
            } else {
              res.json({
                success: true,
                message: "Teacher deleted successfully",
              });
            }
          }
        );
      }
    }
  );
});

// Route to create a new teacher with validations
router.post("/api/teachers", verifyToken, async (req, res) => {
  try {
    const { csvData } = req.body;
    let uploadedCount = 0;
    let skippedCount = 0;
    let matchCount = 0; // Initialize matchCount to 0

    // Create a map to store the counts of each unique combination of roll number and className
    const TeachersCount = new Map();

    for (const teacherData of csvData) {
      const { fullName, phone, gender, subject } = teacherData;

      // Validate teacher data as before
      if (!fullName || !phone || !gender || !subject) {
        console.error("Invalid request data:", teacherData);
        continue; // Skip this row and continue with the next one
      }

      // Check if a teacher with the same roll number and same subject  already exists in the database
      const teacherExistsQuery =
        "SELECT COUNT(*) as count FROM teachers WHERE fullName = ? AND subject = ?";

      let shouldSkip = false;

      await new Promise((resolve, reject) => {
        db.get(teacherExistsQuery, [fullName, subject], (err, result) => {
          if (err) {
            reject(err);
          } else {
            const teacherCount = result.count;
            if (teacherCount > 0) {
              console.error(
                `teacher with the same roll number already exists in:`,
                teacherData
              );
              skippedCount++;
              shouldSkip = true;
              // Increment matchCount when a match is found
              matchCount++;
            }
            resolve();
          }
        });
      });
      const IfExistKey = fullName + subject;
      const existingCount = TeachersCount.get(IfExistKey) || 0;
      TeachersCount.set(IfExistKey, existingCount + 1);

      if (shouldSkip) {
        continue;
      }

      const teacherId = crypto.randomUUID();
      await db.run(
        "INSERT INTO teachers (teacherId, fullName, phone, gender,subject) VALUES (?, ?, ?, ?, ?)",
        [teacherId, fullName, phone, gender, subject]
      );
      uploadedCount++;
    }
    // Check if all rows have the same roll number and className or if all rows are duplicated
    if (
      (matchCount === csvData.length && csvData.length > 0) ||
      (csvData.length > 0 &&
        Array.from(TeachersCount.values()).every((count) => count > 1))
    ) {
      return res.status(409).json({
        success: false,
        message: "Same Data is already exist OR All rows have the same fields OR all rows are duplicated.",
      });
    }

    const responseMessage = `Uploaded ${uploadedCount} teachers, skipped ${skippedCount} duplicates.`;

    res.json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error("Error uploading teachers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
