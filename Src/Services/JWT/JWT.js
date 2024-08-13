const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(data) {
  return jwt.sign(data, process.env.PRIVATE_TOKEN, { expiresIn: "3h" });
}

module.exports = { generateToken };
