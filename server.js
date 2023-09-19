const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const expressApp = express();
expressApp.use(cors());
expressApp.use(bodyParser.json());

module.exports = expressApp;
