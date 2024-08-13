const express = require("express");
const {
  handleDownloadFile,
  handleGetPdf,
  handleProxyImage,
  handleGetImage,
  handleUploadFile,
} = require("../Controllers/GoogleDrive/GoogleDrive");

const multer = require("multer");
const router = express.Router();

const storage = multer.memoryStorage(); // Store file in memory (can also use diskStorage)
const upload = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
});

router
  .get("/downloadFile", handleDownloadFile)
  .get("/pdf", handleGetPdf)
  .get("/proxyImage", handleProxyImage)
  .get("/getImage", handleGetImage)
  .post("/upload", upload.single("file"), handleUploadFile);

module.exports = router;
