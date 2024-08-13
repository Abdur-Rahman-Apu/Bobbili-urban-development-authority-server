const express = require("express");
const {
  handleGetAllApps,
  handleGetAppsByQuery,
  handleGetAmountWithApps,
  handleGetChartData,
  handleGetSerialNo,
  handleGetVerificationStatus,
  handleGetPageWiseApps,
} = require("../Controllers/Apps/Apps");
const router = express.Router();

router
  .get("/", handleGetAllApps)
  .get("/serialNo", handleGetSerialNo)
  .get("/findByQuery", handleGetAppsByQuery)
  .get("/amountWithApps", handleGetAmountWithApps)
  .get("/getChartDetails", handleGetChartData)
  .get("/verificationStatus", handleGetVerificationStatus)
  .get("/pageWise", handleGetPageWiseApps);

module.exports = router;
