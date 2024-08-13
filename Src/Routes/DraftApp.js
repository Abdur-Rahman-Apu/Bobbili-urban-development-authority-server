const express = require("express");
const {
  getDraftAppByUserId,
  getAllDraftApps,
  addDraftApp,
  deleteSingleDraftApp,
  deleteDraftAppAndInsertIntoSubmit,
  handleUpdateDraftApp,
} = require("../Controllers/DraftApp/DraftApp");
const { verifyToken } = require("../Middlewares/JWT.js/JWT");
const router = express.Router();

router
  .get("/getById/:id", verifyToken, getDraftAppByUserId)
  .get("/all", getAllDraftApps)
  .post("/add", addDraftApp)
  .patch("/update", handleUpdateDraftApp)
  .delete("/single", deleteSingleDraftApp)
  .delete("/singleAndTransferToSubmit", deleteDraftAppAndInsertIntoSubmit);

module.exports = router;
