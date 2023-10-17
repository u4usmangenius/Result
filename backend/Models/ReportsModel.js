const express = require("express");
const router = express.Router();
const db = require("../db/Sqlite").db;
const { verifyToken } = require("./authMiddleware");

router.get("/hello", verifyToken, (req, res) => {
  res.status(200).send(`<h1>Hello</h1>`);
});
module.exports = router;
