const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../../db/Sqlite").db;
const { verifyToken } = require("../VerifyToken/authMiddleware");
// Route to create a new teacher
// Route to get paginated teachers with validations
router.get("/api/teachers",verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const filter = req.query.filter || ""; // Get the filter query parameter
  const search = req.query.search || ""; // Get the search query parameter

  const offset = (page - 1) * pageSize;

  let query = `
      SELECT teacherId, fullName, subject, userName, gender, phone 
      FROM teachers 
      WHERE 1=1`;

  const params = [];

  // if (filter === "subject" || filter === "gender") {
  //   query += ` AND ${filter} = ?`;
  //   params.push(search);
  // } 
  if (
    filter === "fullName" ||
    filter === "userName" ||
    filter === "subject" ||
    filter === "gender" ||
    filter === "phone"
  ) {
    query += ` AND ${filter} LIKE ?`;
    params.push(`%${search}%`);
  } else if (filter === "all") {
    // Handle global search
    query += ` AND (fullName LIKE ? OR subject LIKE ? OR userName LIKE ? OR gender LIKE ? OR phone LIKE ?)`;
    params.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    );
  }

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

          res.json({ success: true, teachers: pageResults, totalPages });
        }
      });
    }
  });
});

// Route to create a new teacher with validations
router.post("/api/teachers",verifyToken, (req, res) => {
  const { fullName, subject, userName, gender, phone, password } = req.body;

  // Check if any required field is missing
  if (!fullName || !subject || !gender || !userName || !phone || !password) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }

  const teacherId = crypto.randomUUID();
  db.run(
    "INSERT INTO teachers (teacherId, fullName, subject, userName, gender, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [teacherId, fullName, subject, userName, gender, phone, password],
    (err) => {
      if (err) {
        console.error("Error inserting teacher:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else {
        res.json({ success: true, message: "Teacher Inserted successfully" });
      }
    }
  );
});

// create api for handling multiple data from frontend in array (csv)
// Route to update a teacher by ID (excluding password)
router.put("/api/teachers/:teacherId",verifyToken, (req, res) => {
  const teacherId = req.params.teacherId;
  const { fullName, subject, userName, gender, phone } = req.body;

  // Check if any required field is missing
  if (!fullName || !subject || !gender || !userName || !phone) {
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
          userName === row.userName &&
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
            "UPDATE teachers SET fullName=?, subject=?, userName=?, gender=?, phone=? WHERE teacherId=?",
            [fullName, subject, userName, gender, phone, teacherId],
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
router.delete("/api/teachers/:teacherId",verifyToken, (req, res) => {
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

// upload multiple teachers using csv
router.post("/api/teachers/upload-csv",verifyToken, (req, res) => {
  const { csvData } = req.body;

  // Check if the required CSV data is provided
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    res.status(400).json({ success: false, message: "Invalid CSV data" });
    return;
  }

  // Assuming your CSV columns match the teacher data fields
  const teachersToAdd = csvData.map((row) => ({
    fullName: row.fullName,
    subject: row.subject,
    userName: row.userName,
    gender: row.gender,
    phone: row.phone,
    password: row.password,
  }));

  // Now, you can add the teachers to the database
  const teacherInsertPromises = teachersToAdd.map((teacher) => {
    return new Promise((resolve, reject) => {
      const teacherId = crypto.randomUUID();
      db.run(
        "INSERT INTO teachers (teacherId, fullName, subject, userName, gender, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          teacherId,
          teacher.fullName,
          teacher.subject,
          teacher.userName,
          teacher.gender,
          teacher.phone,
          teacher.password,
        ],
        (err) => {
          if (err) {
            console.error("Error inserting teacher:", err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  });

  Promise.all(teacherInsertPromises)
    .then(() => {
      res.json({ success: true, message: "Teachers inserted successfully" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    });
});

module.exports = router;
