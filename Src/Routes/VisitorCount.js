const express = require("express");
const {
  getVisitorAmount,
} = require("../Controllers/VisitorCount/VisitorCount");
const router = express.Router();

router.get("/", getVisitorAmount);

module.exports = router;
