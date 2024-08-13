const { client } = require("../Configs/ConnectDB");

const userCollection = client
  .db("Construction-Application")
  .collection("users");

const submitApplicationCollection = client
  .db("Construction-Application")
  .collection("submitApplication");

const draftApplicationCollection = client
  .db("Construction-Application")
  .collection("draftApplications");
const approvedCollection = client
  .db("Construction-Application")
  .collection("approvedApplication");
const shortfallCollection = client
  .db("Construction-Application")
  .collection("shortfallApplication");
const rejectedCollection = client
  .db("Construction-Application")
  .collection("rejectedApplication");

const districtCollection = client
  .db("Construction-Application")
  .collection("districts");

const messageCollection = client
  .db("Construction-Application")
  .collection("messageRequest");

const visitorCountCollection = client
  .db("Construction-Application")
  .collection("visitorCount");

const psOtpCollection = client
  .db("Construction-Application")
  .collection("psSignOtp");
const forgotPassOtpCollection = client
  .db("Construction-Application")
  .collection("forgotPasswordOtp");
const paymentCollection = client
  .db("Construction-Application")
  .collection("payment");

module.exports = {
  userCollection,
  submitApplicationCollection,
  draftApplicationCollection,
  approvedCollection,
  shortfallCollection,
  rejectedCollection,
  districtCollection,
  messageCollection,
  visitorCountCollection,
  psOtpCollection,
  forgotPassOtpCollection,
  paymentCollection,
};
