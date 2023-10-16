const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db/Sqlite").db;
const { verifyToken } = require("./authMiddleware");
const {
  checkStudentSubjectExists,
  fetchSubjectId,
  insertStudentSubject,
  fetchStudentById,
  deleteStudent,
  deleteStudentSubjects,
  updateStudent,
  updateStudentSubjects,
  arraysEqual,
  getStudentSubjects,
} = require("./StudentHelper");

// send data matched with ClassName
router.post("/api/students/ClassName", verifyToken, (req, res) => {
  const { ClassName } = req.body;
  db.all(
    "SELECT * FROM students WHERE ClassName = ?",
    [ClassName],
    (err, rows) => {
      if (err) {
        console.error("Error fetching result data:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else {
        if (rows.length === 0) {
          res.status(404).json({
            success: false,
            message: "No results found for the provided ClassName",
          });
        } else {
          res.json({ success: true, data: rows });
        }
      }
    }
  );
});
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
  const pageSize = parseInt(req.body.pageSize) || 10;
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
  try {
    const { csvData } = req.body;
    console.log(req.body);
    let uploadedCount = 0;
    let skippedCount = 0;
    let matchCount = 0; // Initialize matchCount to 0

    // Create a map to store the counts of each unique combination of roll number and className
    const rollClassNameCounts = new Map();

    for (const studentData of csvData) {
      const {
        fullName,
        className,
        stdRollNo,
        gender,
        stdPhone,
        guard_Phone,
        Batch,
        subjects,
      } = studentData;

      // Validate student data as before
      if (
        !fullName ||
        !className ||
        !gender ||
        !stdRollNo ||
        !Batch ||
        !subjects ||
        subjects.length !== 6
      ) {
        console.error("Invalid request data:", studentData);
        continue; // Skip this row and continue with the next one
      }

      // Check if a student with the same roll number and class name already exists in the database
      const studentExistsQuery =
        "SELECT COUNT(*) as count FROM students WHERE stdRollNo = ? AND className = ?";

      let shouldSkip = false;

      await new Promise((resolve, reject) => {
        db.get(studentExistsQuery, [stdRollNo, className], (err, result) => {
          if (err) {
            reject(err);
          } else {
            const studentCount = result.count;

            if (studentCount > 0) {
              console.error(
                `Student with the same roll number already exists in class ${className}:`,
                studentData
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

      // Check if this combination of roll number and className is already counted
      const rollClassNameKey = stdRollNo + className;
      const existingCount = rollClassNameCounts.get(rollClassNameKey) || 0;
      rollClassNameCounts.set(rollClassNameKey, existingCount + 1);

      if (shouldSkip) {
        continue;
      }

      const studentId = crypto.randomUUID();

      await db.run(
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
        ]
      );

      const subjectNames = subjects
        .join(",")
        .split(",")
        .map((subject) => subject.trim())
        .filter((subject) => subject !== "");

      if (subjectNames.length !== 6) {
        console.error("Invalid subjects:", subjectNames);
        continue;
      }
      for (const subjectName of subjectNames) {
        const subjectRow = await fetchSubjectId(subjectName);

        if (subjectRow) {
          const subjectId = subjectRow.subjectId;

          const std_subjectId = crypto.randomUUID();
          await insertStudentSubject(
            std_subjectId,
            studentId,
            subjectId,
            stdRollNo,
            subjectName
          );
        } else {
          console.error(
            `Subject not found in the subjects table: ${subjectName}`
          );
        }
      }

      uploadedCount++;
    }

    // Check if all rows have the same roll number and className or if all rows are duplicated
    if (
      (matchCount === csvData.length && csvData.length > 0) ||
      (csvData.length > 0 &&
        Array.from(rollClassNameCounts.values()).every((count) => count > 1))
    ) {
      return res.status(409).json({
        success: false,
        message:
          "All rows have the same roll number and class name or all rows are duplicated.",
      });
    }

    const responseMessage = `Uploaded ${uploadedCount} students, skipped ${skippedCount} duplicates.`;

    res.json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error("Error uploading students:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
// Route to update a student by ID (excluding password)
router.put("/api/students/:studentId", verifyToken, async (req, res) => {
  const studentId = req.params.studentId;
  const { student, subjects } = req.body;
  console.log(student, subjects);
  if (
    !student.fullName ||
    !student.className ||
    !student.gender ||
    !student.stdRollNo ||
    !student.stdPhone ||
    !student.Batch ||
    !student.guard_Phone
  ) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
    return;
  }

  try {
    const existingStudent = await fetchStudentById(studentId);

    if (!existingStudent) {
      res.status(404).json({ success: false, message: "Student not found" });
      return;
    }

    // Check if the new data is different from the existing data
    const studentInfoChanged =
      student.fullName !== existingStudent.fullName ||
      student.className !== existingStudent.className ||
      student.stdRollNo !== existingStudent.stdRollNo ||
      student.gender !== existingStudent.gender ||
      student.Batch !== existingStudent.Batch ||
      student.guard_Phone !== existingStudent.guard_Phone ||
      student.stdPhone !== existingStudent.stdPhone;

    // Check if there is a change in subjects
    const existingSubjects = await getStudentSubjects(studentId);
    const subjectsChanged = !arraysEqual(existingSubjects, subjects);

    // Check if the subjects sent from the frontend exist in the subjects table
    const subjectIds = [];
    for (const subjectName of subjects) {
      const subjectRow = await fetchSubjectId(subjectName);
      if (!subjectRow) {
        res.status(400).json({
          success: false,
          message: `Subject '${subjectName}' does not exist in the subjects table`,
        });
        return;
      }
      subjectIds.push(subjectRow.subjectId);
    }

    if (studentInfoChanged || subjectsChanged) {
      // Update the student's information (excluding password)
      await updateStudent(studentId, student);

      // Update subjects in student_subject table
      await updateStudentSubjects(studentId, subjects);

      res.json({
        success: true,
        message: "Student updated successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No changes detected. Student data remains the same",
      });
    }
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
// Route to delete a student by ID with his subjects
router.delete("/api/students/:studentId", verifyToken, async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const studentRow = await fetchStudentById(studentId);

    if (!studentRow) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    await deleteStudent(studentId);
    await deleteStudentSubjects(studentId);

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
module.exports = router;
