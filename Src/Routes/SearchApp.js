const express = require("express");
const {
  handleSearchAppByAppNo,
  handleSearchByOwnerName,
  handleSearchForPsByAppNo,
  handleSearchForPsByOwnerName,
  handleGetPsApplications,
} = require("../Controllers/SearchApp/SearchApp");

const router = express.Router();

router
  .get("/byAppNo", handleSearchAppByAppNo)
  .get("/byOwnerName", handleSearchByOwnerName)
  .get("/forPsByAppNo", handleSearchForPsByAppNo)
  .get("/forPsByOwnerName", handleSearchForPsByOwnerName)
  .get("/psApplications", handleGetPsApplications);

module.exports = router;
