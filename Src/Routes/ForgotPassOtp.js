const express = require("express");
const {
  handleAddOtpOfForgotPass,
  handleForgotPassOtpMatch,
} = require("../Controllers/ForgotPassOtp/ForgotPassOtp");
const router = express.Router();

router
  .post("/add", handleAddOtpOfForgotPass)
  .get("/matchOtp", handleForgotPassOtpMatch);

module.exports = router;
