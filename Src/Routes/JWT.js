const express = require("express");
const { handleJWT } = require("../Controllers/JWT/JWT");

const router = express.Router();

router.post("/", handleJWT);

module.exports = router;
