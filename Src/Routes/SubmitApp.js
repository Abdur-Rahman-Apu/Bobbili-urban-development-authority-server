const express = require("express");
const {
  getAllSubmitAppByUserId,
  getAllSubmitAppByPsInfo,
  getSubmitAppByAppNo,
  handleUpdateSubmitAppByPs,
  handleDecisionOfPs,
} = require("../Controllers/SubmitApp/SubmitApp");
const router = express.Router();

router
  .get("/getByUserId", getAllSubmitAppByUserId)
  .get("/getByPsInfo", getAllSubmitAppByPsInfo)
  .get("/getByAppNo", getSubmitAppByAppNo)
  .patch("/recommendByPs", handleUpdateSubmitAppByPs)
  .delete("/", handleDecisionOfPs);

module.exports = router;
