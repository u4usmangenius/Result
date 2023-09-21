const sqlite3 = require("sqlite3").verbose();

// Create and connect to the SQLite database
const db = new sqlite3.Database("Result.sqlite");

// crating login user
// Creating login user table
async function createUserTable() {
  return new Promise((resolve, reject) => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS user (
        username varchar(255) PRIMARY KEY,
        password varchar(255)
      )
    `,
      (err) => {
        if (err) {
          console.error("Error creating user table:", err);
          reject(err);
        } else {
          console.log("Successfully created user table");
          resolve();
        }
      }
    );
  });
}

// Logged in user credentials
const data = {
  username: "admin",
  password: "admin",
};

async function insertUser() {
  try {
    await createUserTable(); // Wait for table creation to complete
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO user (username, password) VALUES (?, ?)",
        [data.username, data.password],
        (err) => {
          if (err) {
            console.error("Error inserting user:", err);
            reject(err);
          } else {
            console.log("Admin user created");
            resolve();
          }
        }
      );
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

// Call the function to insert the user
insertUser();

// Create teachers
db.run(
  `
  CREATE TABLE IF NOT EXISTS teachers (
    teacherId TEXT PRIMARY KEY,
    fullName TEXT,
    subject TEXT,
    gender TEXT,
    phone TEXT,
    password TEXT
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating teachers table:", err);
    }
  }
);
// Create students tables

db.run(
  `
  CREATE TABLE IF NOT EXISTS students (
    studentId TEXT PRIMARY KEY,
    fullName TEXT,
    stdRollNo TEXT UNIQUE,
    className TEXT,
    gender TEXT,
    stdPhone TEXT,
    guard_Phone TEXT,
    Batch TEXT
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating students table:", err);
    }
  }
);
// creating subject table
db.run(
  `
  CREATE TABLE IF NOT EXISTS subjects (
    subjectId varchar(255) PRIMARY KEY,
    subjectName varchar(255),
    courseCode varchar(255)
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating subjects table:", err);
    }
  }
);

// creating junction of subjects from students and subjects
// Create a junction table for student and subject relationships
db.run(
  `
  CREATE TABLE IF NOT EXISTS student_subject (
    std_subjectId varchar(255) PRIMARY KEY,
    studentId TEXT,
    subjectId TEXT,
    stdRollNo varchar(255),
    userSubject varchar(255),
    FOREIGN KEY (studentId) REFERENCES students(studentId),
    FOREIGN KEY (subjectId) REFERENCES subjects(subjectId)
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating student_subject table:", err);
    }
  }
);
// test table
// Create a new table for test results with foreign keys to students and subjects
db.run(
  `
  CREATE TABLE IF NOT EXISTS tests (
    testId TEXT PRIMARY KEY,
    TestName TEXT,
    SubjectName TEXT,
    TotalMarks INTEGER,
    ClassName TEXT,
    studentId TEXT,
    subjectId TEXT,
    FOREIGN KEY (studentId) REFERENCES students(studentId),
    FOREIGN KEY (subjectId) REFERENCES subjects(subjectId)
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating test_results table:", err);
    }
  }
);
// result table
// Create a new table for result  with foreign keys to students and tests

db.run(
  `
  CREATE TABLE IF NOT EXISTS result (
    resultId TEXT PRIMARY KEY,
    userName TEXT,
    TestName TEXT,
    TotalMarks TEXT,
    SubjectName TEXT,
    fullName TEXT,
    ClassName TEXT,
    ObtainedMarks INTEGER,
    Batch TEXT,
    studentId TEXT,
    testId TEXT,
    FOREIGN KEY (studentId) REFERENCES students(studentId),
    FOREIGN KEY (testId) REFERENCES tests(testtId)
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating test_results table:", err);
    }
  }
);

module.exports = {
  db, // Export the database instance for use in other modules
};
