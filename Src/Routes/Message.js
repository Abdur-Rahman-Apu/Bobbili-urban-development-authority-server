const express = require("express");
const {
  handleGetMessages,
  handleRequestMessage,
  handleNotAcceptedMessages,
  handleUpdateMessage,
  handleDeleteMessage,
  handleMissedMessages,
  handleAcceptedMessages,
} = require("../Controllers/Message/Message");

const router = express.Router();

router
  .get("/", handleGetMessages)
  .post("/", handleRequestMessage)
  .patch("/", handleUpdateMessage)
  .delete("/", handleDeleteMessage)
  .get("/notAccepted", handleNotAcceptedMessages)
  .get("/missed", handleMissedMessages)
  .get("/accepted", handleAcceptedMessages);

module.exports = router;
