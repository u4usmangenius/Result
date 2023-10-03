// Import the necessary modules and dependencies
const db = require("../db/Sqlite").db;

// Helper function to check if a student_subject record with the same roll number and subject exists
function checkStudentSubjectExists(stdRollNo, subjectName) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) as count FROM student_subject WHERE stdRollNo = ? AND userSubject = ?",
      [stdRollNo, subjectName],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.count);
        }
      }
    );
  });
}

// Helper function to fetch subjectId from the subjects table
function fetchSubjectId(subjectName) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT subjectId FROM subjects WHERE subjectName = ?",
      [subjectName],
      (err, subjectRow) => {
        if (err) {
          reject(err);
        } else {
          resolve(subjectRow);
        }
      }
    );
  });
}

// Helper function to insert data into the student_subject table
function insertStudentSubject(
  std_subjectId,
  studentId,
  subjectId,
  stdRollNo,
  userSubject
) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO student_subject (std_subjectId, studentId, subjectId, stdRollNo, userSubject) VALUES (?, ?, ?, ?, ?)",
      [std_subjectId, studentId, subjectId, stdRollNo, userSubject],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

// Export the helper functions
module.exports = {
  checkStudentSubjectExists,
  fetchSubjectId,
  insertStudentSubject,
};
