const express = require("express");
const {
  getApprovedAppByAppNo,
} = require("../Controllers/ApprovedApp/ApprovedApp");

const router = express.Router();

router.get("/getByAppNo", getApprovedAppByAppNo);

module.exports = router;
