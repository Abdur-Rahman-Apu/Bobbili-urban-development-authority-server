const express = require("express");
const {
  getRejectedAppByUserId,
} = require("../Controllers/RejectedApp/RejectedApp");

const router = express.Router();

router.get("/", getRejectedAppByUserId);

module.exports = router;
