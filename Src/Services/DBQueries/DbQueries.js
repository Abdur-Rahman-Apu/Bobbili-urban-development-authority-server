const { ObjectId } = require("mongodb");
const {
  rejectedCollection,
  approvedCollection,
  districtCollection,
  shortfallCollection,
  submitApplicationCollection,
  userCollection,
  forgotPassOtpCollection,
  psOtpCollection,
  draftApplicationCollection,
  messageCollection,
  paymentCollection,
} = require("../../Models/collections");

// district related queries start from here
const allDistricts = async () => {
  return await districtCollection.find({}).toArray();
};

const updateDistricts = async (filter, updateDoc) => {
  return await districtCollection.updateOne(filter, updateDoc);
};

// user collection related queries start from here
const getAllUsers = async () => {
  return await userCollection.find({}).toArray();
};

const findUserByQuery = async (query) => {
  return await userCollection.find(query).toArray();
};

const findUserById = async (id) => {
  return await userCollection.findOne({ _id: new ObjectId(id) });
};

const findUserByUserId = async (userId) => {
  return await userCollection.findOne({ userId });
};

const insertUser = async (data) => {
  return await userCollection.insertOne(data);
};

const updateUserInfo = async (filter, updateDoc) => {
  return await userCollection.updateOne(filter, updateDoc);
};

const deleteUser = async (query) => {
  return await userCollection.deleteOne(query);
};

// draft application collection queries start from here
const allDraftApps = async () => {
  return await draftApplicationCollection.find({}).toArray();
};

const findDraftAppsByUserId = async (id) => {
  return await draftApplicationCollection
    .find({
      userId: id,
    })
    .toArray();
};

const insertDraftApp = async (data) => {
  return await draftApplicationCollection.insertOne(data);
};

const updateDraftApp = async (filter, updateDoc) => {
  return await draftApplicationCollection.updateOne(filter, updateDoc);
};

const removeSingleDraftApp = async (query) => {
  return await draftApplicationCollection.deleteOne(query);
};

const findDraftAppsByQuery = async (filter) => {
  return await draftApplicationCollection.find(filter).toArray();
};

const findDraftAppByQuery = async (query) => {
  return await draftApplicationCollection.findOne(query);
};

// rejected application related queries start from here
const insertRejectedApp = async (data) => {
  return await rejectedCollection.insertOne(data);
};

const findRejectedAppUsingUserId = async (userId) => {
  return await rejectedCollection.find({ userId }).toArray();
};

const findRejectedAppsByQuery = async (query) => {
  return await rejectedCollection.find(query).toArray();
};

const findRejectedAppUsingAppNo = async (appNo) => {
  return await rejectedCollection.findOne({ applicationNo: appNo });
};

// approved application related queries start from here
const insertApprovedApp = async (data) => {
  return await approvedCollection.insertOne(data);
};

const findApprovedAppsByQuery = async (query) => {
  return await approvedCollection.find(query).toArray();
};

const findApprovedAppUsingAppNo = async (appNo) => {
  return await approvedCollection.findOne({ applicationNo: appNo });
};

// shortfall application related queries start from here
const findShortfallAppsByQuery = async (query) => {
  return await shortfallCollection.find(query).toArray();
};

const findShortfallAppUsingAppNo = async (appNo) => {
  return shortfallCollection.findOne({ applicationNo: appNo });
};

const allShortfallApps = async () => {
  return await shortfallCollection.find({}).toArray();
};

const insertShortfallApp = async (data) => {
  return await shortfallCollection.insertOne(data);
};

const updateShortfallApp = async (query, updateDoc) => {
  return await shortfallCollection.updateOne(query, updateDoc);
};

const deleteShortfallApp = async (query) => {
  return await shortfallCollection.deleteOne(query);
};

// submit app related queries start from here
const findSubmitAppsByQuery = async (query) => {
  return await submitApplicationCollection.find(query).toArray();
};

const findSubmitAppByAppNo = async (appNo) => {
  return await submitApplicationCollection.findOne({
    applicationNo: appNo,
  });
};
const findSubmitAppByQuery = async (query) => {
  return await submitApplicationCollection.findOne(query);
};

const insertSubmitApp = async (data) => {
  return await submitApplicationCollection.insertOne(data);
};

const updateSubmitAppByPs = async (filter, updateDoc) => {
  return await submitApplicationCollection.updateOne(filter, updateDoc);
};

const deleteSubmitApp = async (query) => {
  return await submitApplicationCollection.deleteOne(query);
};

// forgot password otp collection queries start from here
const insertForgotPassOtp = async (data) => {
  return await forgotPassOtpCollection.insertOne(data);
};

const deleteForgotPassOtp = async (query) => {
  return await forgotPassOtpCollection.deleteOne(query);
};

const findForgotPassOtpByUserId = async (query) => {
  return await forgotPassOtpCollection.findOne(query);
};

// ps sign otp collection queries start from here
const insertPsSignOtp = async (data) => {
  return await psOtpCollection.insertOne(data);
};

const deletePsSignOtp = async (query) => {
  return await psOtpCollection.deleteOne(query);
};

const findPsSignOtp = async (query) => {
  return await psOtpCollection.findOne(query);
};

// message collection related queries start from here
const findMessagesById = async (id) => {
  return await messageCollection.findOne({ _id: new ObjectId(id) });
};

const findMessagesByQuery = async (query) => {
  return await messageCollection.find(query).toArray();
};

const deleteMessage = async (query) => {
  return await messageCollection.deleteOne(query);
};

const insertMessage = async (data) => {
  return await messageCollection.insertOne(data);
};

const updateMessage = async (query, updatedDoc) => {
  return await messageCollection.updateOne(query, updatedDoc);
};

// payment collection queries start from here
const insertPayment = async (data) => {
  return await paymentCollection.insertOne(data);
};
const updatePayment = async (query, updatedDoc) => {
  return await paymentCollection.updateOne(query, updatedDoc);
};

const findAndDeletePreviousPayDetails = async (query) => {
  const findApp = await paymentCollection.findOne(query);
  if (findApp) {
    await paymentCollection.deleteOne(query);
  }
};

const findPaymentInfoByQuery = async (query) => {
  return await paymentCollection.findOne(query);
};

const findPaymentInfosBySearchQuery = async (query) => {
  return await paymentCollection.find(query).toArray();
};

module.exports = {
  allDistricts,
  getAllUsers,
  insertUser,
  deleteUser,
  findUserByQuery,
  findUserByUserId,
  findUserById,
  updateUserInfo,
  allDraftApps,
  findDraftAppsByUserId,
  findDraftAppByQuery,
  findDraftAppsByQuery,
  insertDraftApp,
  updateDraftApp,
  removeSingleDraftApp,
  allShortfallApps,
  updateDistricts,
  insertShortfallApp,
  updateShortfallApp,
  deleteShortfallApp,
  findShortfallAppsByQuery,
  findShortfallAppUsingAppNo,
  insertRejectedApp,
  findRejectedAppUsingUserId,
  findRejectedAppsByQuery,
  findRejectedAppUsingAppNo,
  insertApprovedApp,
  findApprovedAppsByQuery,
  findApprovedAppUsingAppNo,
  insertSubmitApp,
  updateSubmitAppByPs,
  deleteSubmitApp,
  findSubmitAppsByQuery,
  findSubmitAppByQuery,
  findSubmitAppByAppNo,
  insertForgotPassOtp,
  findForgotPassOtpByUserId,
  deleteForgotPassOtp,
  insertPsSignOtp,
  deletePsSignOtp,
  findPsSignOtp,
  findMessagesById,
  findMessagesByQuery,
  deleteMessage,
  insertMessage,
  updateMessage,
  insertPayment,
  findPaymentInfoByQuery,
  updatePayment,
  findPaymentInfosBySearchQuery,
  findAndDeletePreviousPayDetails,
};
