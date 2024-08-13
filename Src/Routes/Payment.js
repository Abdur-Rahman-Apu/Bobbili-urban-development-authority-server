const express = require("express");
const {
  handleStoreInitialPaymentInfo,
  handlePaymentRequest,
  handlePaymentResponse,
  handleGetPayInfo,
  handleSearchPayInfo,
} = require("../Controllers/Payment/Payment");
const router = express.Router();

router
  .get("/payInfo", handleGetPayInfo)
  .get("/search", handleSearchPayInfo)
  .post("/insert", handleStoreInitialPaymentInfo)
  .post("/request", handlePaymentRequest)
  .post("/response", handlePaymentResponse);

module.exports = router;
