const express = require("express");
const { handleLogin } = require("../Controllers/Auth/Auth");
const router = express.Router();

router.get("/login", handleLogin);

module.exports = router;
