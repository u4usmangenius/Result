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
}); // Route to create a new teacher
// Route to get paginated teachers with validations
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
router.post("/api/teachers", verifyToken, (req, res) => {
  const { fullName, subject, gender, phone } = req.body;

  // Check if any required field is missing
  if (!fullName || !subject || !gender || !phone) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }
  db.get(
    "SELECT COUNT(*) as count FROM teachers WHERE fullName = ? AND subject = ? AND gender = ? AND phone = ?",
    [fullName, subject, gender, phone],
    async (err, row) => {
      if (err) {
        console.error("Error checking teacher existence:", err);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else {
        const teacherCount = row.count;
        if (teacherCount > 0) {
          return res.status(400).json({
            success: false,
            message: "Teacher with the same data already exists",
          });
        } else {
          // If the teacher does not exist, insert it into the database
          const teacherId = crypto.randomUUID();
          db.run(
            "INSERT INTO teachers (teacherId, fullName, subject, gender, phone) VALUES (?, ?, ?, ?, ?)",
            [teacherId, fullName, subject, gender, phone],
            (err) => {
              if (err) {
                console.error("Error inserting teacher:", err);
                return res
                  .status(500)
                  .json({ success: false, message: "Internal server error" });
              } else {
                console.log("Teacher inserted successfully");
                return res.json({
                  success: true,
                  message: "Teacher inserted successfully",
                });
              }
            }
          );
        }
      }
    }
  );
});
// upload multiple teachers using csv
router.post("/api/teachers/upload-csv", verifyToken, async (req, res) => {
  const { csvData } = req.body;
  console.error("csv-------csv", csvData);
  // Check if the required CSV data is provided
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid CSV data" });
  }
  if (
    !csvData.fullName ||
    !csvData.subject ||
    !csvData.gender ||
    !csvData.phone
  ) {
    console.log("All Filds are required")
    return res
      .status(400)
      .json({ success: false, message: "All CSV Fields are Required" });
  }

  // Assuming your CSV columns match the teacher data fields
  const teachersToAdd = csvData.map((row) => ({
    fullName: row.fullName,
    subject: row.subject,
    gender: row.gender,
    phone: row.phone,
  }));

  // Check if any of the teachers in the CSV already exist
  const existingTeachers = await Promise.all(
    teachersToAdd.map(async (teacher) => {
      return new Promise(async (resolve, reject) => {
        // Check if a teacher with the same data already exists
        const count = await new Promise((resolveCount, rejectCount) => {
          db.get(
            "SELECT COUNT(*) as count FROM teachers WHERE fullName = ? AND subject = ? AND gender = ? AND phone = ?",
            [teacher.fullName, teacher.subject, teacher.gender, teacher.phone],
            (err, row) => {
              if (err) {
                rejectCount(err);
              } else {
                resolveCount(row.count);
              }
            }
          );
        });

        if (count > 0) {
          resolve(teacher); // Teacher already exists
        } else {
          resolve(null); // Teacher does not exist
        }
      });
    })
  );

  // Filter out the existing teachers
  const newTeachers = teachersToAdd.filter(
    (teacher) => existingTeachers.indexOf(teacher) === -1
  );

  // Now, you can add the new teachers to the database
  const teacherInsertPromises = newTeachers.map((teacher) => {
    return new Promise((resolve, reject) => {
      const teacherId = crypto.randomUUID();
      db.run(
        "INSERT INTO teachers (teacherId, fullName, subject, gender, phone) VALUES (?, ?, ?, ?, ?)",
        [
          teacherId,
          teacher.fullName,
          teacher.subject,
          teacher.gender,
          teacher.phone,
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
