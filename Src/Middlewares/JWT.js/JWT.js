const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next) {
  const bearerHeader = req?.cookies?.jwToken;

  console.log(bearerHeader, typeof bearerHeader, "bearer header");

  if (bearerHeader === "null" || typeof bearerHeader === "undefined") {
    console.log("BACHA HERE");
    return res.status(401).send({ message: "Unauthorized Access" });
  } else {
    console.log("HERE");
    let bearer = bearerHeader.replaceAll('"', "");
    console.log(bearer, "BEARER");
    bearer = bearer.split(" ");
    const token = bearer[1];
    console.log(token, "TOKEN");

    jwt.verify(token, process.env.PRIVATE_TOKEN, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized access." });
      }
      console.log(decoded, "DECODED");
      req.token = token;
      return next();
    });
  }
}

module.exports = { verifyToken };
