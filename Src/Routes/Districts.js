const express = require("express");
const {
  getAllDistricts,
  addLocation,
  removeLocation,
} = require("../Controllers/Districts/Districts");
const router = express.Router();

router
  .get("/", getAllDistricts)
  .patch("/add", addLocation)
  .patch("/remove", removeLocation);

module.exports = router;
