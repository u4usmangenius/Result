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
// helper for delete a student corresponding their subjects
function fetchStudentById(studentId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM students WHERE studentId = ?",
      [studentId],
      (err, studentRow) => {
        if (err) {
          reject(err);
        } else {
          resolve(studentRow);
        }
      }
    );
  });
}
function deleteStudent(studentId) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM students WHERE studentId = ?", [studentId], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
function deleteStudentSubjects(studentId) {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM student_subject WHERE studentId = ?",
      [studentId],
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

// getting student_subject junction table subjects
async function getStudentSubjects(studentId) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT userSubject FROM student_subject WHERE studentId = ?",
      [studentId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const subjects = rows.map((row) => row.userSubject);
          resolve(subjects);
        }
      }
    );
  });
}
// Helper function to update student data
async function updateStudent(studentId, updatedData) {
  return new Promise((resolve, reject) => {
    const {
      fullName,
      className,
      stdRollNo,
      gender,
      stdPhone,
      guard_Phone,
      Batch,
    } = updatedData;
    db.run(
      "UPDATE students SET fullName=?, className=?, stdRollNo=?, gender=?, stdPhone=?, guard_Phone=?, Batch=? WHERE studentId=?",
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
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

// Helper function to update student subjects in student_subject table
async function updateStudentSubjects(studentId, subjects) {
  return new Promise((resolve, reject) => {
    // Delete existing subjects for the student
    db.run(
      "DELETE FROM student_subject WHERE studentId = ?",
      [studentId],
      (err) => {
        if (err) {
          reject(err);
        } else {
          // Insert new subjects for the student
          const placeholders = subjects.map(() => "(?, ?)").join(", ");
          const values = subjects.flatMap((subject) => [studentId, subject]);

          const sql = `INSERT INTO student_subject (studentId, userSubject) VALUES ${placeholders}`;

          db.run(sql, values, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      }
    );
  });
}
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}
// Export the helper functions
module.exports = {
  checkStudentSubjectExists,
  fetchSubjectId,
  insertStudentSubject,
  fetchStudentById,
  deleteStudent,
  deleteStudentSubjects,
  getStudentSubjects,
  updateStudent,
  updateStudentSubjects,
  arraysEqual,
};
