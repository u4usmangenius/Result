const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db/Sqlite").db;
const jwtKey = "3L@#$@!^#$#sd###$";
const { verifyToken } = require("./authMiddleware");

router.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT username FROM user WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        console.error("Error executing query:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else if (!row) {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      } else {
        // Generate a JWT token with a 24-hour expiration time
        jwt.sign(
          { username: row.username },
          jwtKey,
          { expiresIn: "24h" },
          (err, token) => {
            if (err) {
              res
                .status(500)
                .json({ success: false, message: "Failed to generate token" });
            } else {
              // Store the token in the backend
              // You can save it in a database or a file as needed
              // For example, if you have a tokens table in your database:
              // db.run("INSERT INTO tokens (username, token) VALUES (?, ?)", [row.username, token]);

              res.json({ success: true, username: row.username, token: token });
            }
          }
        );
      }
    }
  );
});
module.exports = router;
