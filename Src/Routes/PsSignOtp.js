const express = require("express");
const {
  handleInsertPsSignOtp,
  handleMatchPsSignOtp,
} = require("../Controllers/PsSignOtp/PsSignOtp");

const router = express.Router();

router
  .post("/add", handleInsertPsSignOtp)
  .get("/matchOtp", handleMatchPsSignOtp);

module.exports = router;
