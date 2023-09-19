const jwt = require("jsonwebtoken");

const jwtKey = "3L@#$@!^#$#sd###$"; // Replace with your secret key

function verifyToken(req, res, next) {
  let token = req.headers["authorization"];

  if (token) {
    token = token.split(" ")[1];

    jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) {
        res.status(401).json({ success: false, message: "Invalid token" });
      } else {
        req.decoded = decoded; // Store the decoded token in the request object
        next(); // Move on to the next middleware or route
      }
    });
  } else {
    res.status(403).json({ success: false, message: "Token missing in headers" });
  }
}

module.exports = {
  verifyToken,
};
