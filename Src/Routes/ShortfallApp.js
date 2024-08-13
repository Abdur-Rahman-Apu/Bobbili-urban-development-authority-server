const express = require("express");
const {
  getSpecificShortfallApp,
  getShortfallSerialNo,
  handleResubmitShortfallApp,
} = require("../Controllers/ShortfallApp/ShortfallApp");
const router = express.Router();

router
  .get("/specificApp", getSpecificShortfallApp)
  .get("/serial", getShortfallSerialNo)
  .patch("/resubmit", handleResubmitShortfallApp);

module.exports = router;
