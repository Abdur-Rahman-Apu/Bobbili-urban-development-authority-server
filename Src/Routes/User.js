const express = require("express");
const {
  handleReverseLoggedInFlag,
  handleHandoverByPs,
  handleGetUser,
  handleGetUserDetails,
  handleGetAllUser,
  handleAddUser,
  handleUpdateUser,
  handleDeleteUser,
} = require("../Controllers/User/User");
const router = express.Router();

router
  .get("/", handleGetUser)
  .get("/all", handleGetAllUser)
  .get("/allInfoByUserId", handleGetUserDetails)
  .post("/add", handleAddUser)
  .patch("/update/:id", handleUpdateUser)
  .patch("/reverseLoggedInFlag", handleReverseLoggedInFlag)
  .patch("/handOveredByPs", handleHandoverByPs)
  .delete("/delete/:id", handleDeleteUser);

module.exports = router;
