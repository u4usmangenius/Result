const express = require("express");
const router = express.Router();
const db = require("../db/Sqlite").db;
const { verifyToken } = require("./authMiddleware");
const fs = require("fs").promises; // Use fs.promises for asynchronous file operations
const path = require("path");

// Export endpoint
// router.get("/api/export", verifyToken, async (req, res) => {
//     try {
//       const timestamp = new Date().toISOString().replace(/:/g, "-");
//       const backupFileName = `Result-${timestamp}.sqlite`;
  
//       // Specify the absolute path to your source database file
//       const sourceDatabasePath = path.resolve(__dirname, "../../Result.sqlite");
  
//       // Check if the source database file exists asynchronously
//       try {
//         await fs.access(sourceDatabasePath);
//       } catch (err) {
//         return res.status(500).json({ error: "Source database not found" });
//       }
  
//       // Export the database to the backup file
//       db.backup(backupFileName, { from: sourceDatabasePath }, (err) => {
//         if (err) {
//           console.error("Database export failed:", err);
//           return res.status(500).json({ error: "Database export failed" });
//         }
  
//         // Send the backup file as a response
//         res.download(backupFileName, () => {
//           // Remove the backup file after sending it
//           fs.unlink(backupFileName).catch((err) => {
//             console.error("Error deleting backup file:", err);
//           });
//         });
//       });
//     } catch (err) {
//       console.error("Export error:", err);
//       res.status(500).json({ error: "Database export failed" });
//     }
//   });
  
// // Import endpoint
// router.post("/api/import", verifyToken, async (req, res) => {
//   try {
//     const uploadedFile = req.files.database;

//     if (!uploadedFile) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     // Specify the absolute path to your database file
//     const databasePath = path.resolve(__dirname, "../../Result.sqlite");

//     // Replace the current database with the imported file
//     await fs.rename(uploadedFile.path, databasePath);

//     res.status(200).json({ message: "Database imported successfully" });
//   } catch (err) {
//     console.error("Import error:", err);
//     res.status(500).json({ error: "Database import failed" });
//   }
// });

module.exports = router;
