const { app, session, BrowserWindow } = require("electron");

const path = require("path");
const url = require("url");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const expressApp = require("./server");

expressApp.use(cors());
expressApp.use(
  cors({
    allowedHeaders: "Authorization, Content-Type", // Add other headers if needed
  })
);
expressApp.use(
  cors({
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  })
);

expressApp.use(bodyParser.json());
expressApp.use(express.static(path.join(__dirname, "frontend/build")));

const port = 8080;

const teacher_model = require("./backend/Models/TeacherModel");
const user_model = require("./backend/Models/LoginModel");
const student_model = require("./backend/Models/StudentModel");
const subject_model = require("./backend/Models/SubjectModel");
const subject_student_model = require("./backend/Models/studentsubject");
const test_model = require("./backend/Models/TestModel");
const result_model = require("./backend/Models/RseultModel");

expressApp.use("/", user_model);
expressApp.use("/", teacher_model);
expressApp.use("/", student_model);
expressApp.use("/", subject_model);
expressApp.use("/", subject_student_model);
expressApp.use("/", test_model);
expressApp.use("/", result_model);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 950,
    minHeight: 750,
    height: 770,
    minWidth: 950,
    title: "Result Management System",
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      devTools: false,
      OS: "Windows",
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "frontend/build/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  // Open the DevTools during development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.closeDevTools();
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const appSession = session.defaultSession; // Get the default session

  // Clear cache
  appSession.clearCache(() => {
    // Cache cleared
    console.log("Cache cleared.");
  });
});
app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  url;
  if (mainWindow === null) {
    createWindow();
  }
});
// start express
expressApp.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
