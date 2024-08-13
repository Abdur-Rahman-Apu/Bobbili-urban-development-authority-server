const {
  findDraftAppsByUserId,
  allDraftApps,
  insertDraftApp,
  findDraftAppByQuery,
  removeSingleDraftApp,
  insertSubmitApp,
  updateDraftApp,
} = require("../../Services/DBQueries/DbQueries");
const {
  deletePreviousFile,
} = require("../../Services/ManageCloudStorage/ManageCloudStorage");

const getDraftAppByUserId = async (req, res) => {
  console.log(req.cookies, "request in draft applications");

  const id = req.params.id;
  console.log(id);

  const result = await findDraftAppsByUserId(id);
  console.log(result, "result");
  return res.send(result);
};

const getAllDraftApps = async (req, res) => {
  const result = await allDraftApps();
  return res.send(result);
};

const addDraftApp = async (req, res) => {
  const data = req.body;
  console.log(data);
  const result = await insertDraftApp(data);
  return res.send(result);
};

const handleUpdateDraftApp = async (req, res) => {
  const { userId, oldApplicationNo } = JSON.parse(req.query.filterData);
  const newDraftData = req.body;

  const filter = { userId, applicationNo: oldApplicationNo };

  const OldApplicationData = await findDraftAppByQuery(filter);

  console.log(OldApplicationData, "Old draft data");
  console.log(newDraftData, "New draft data");

  if (
    newDraftData?.drawing ||
    newDraftData?.payment ||
    newDraftData?.documents
  ) {
    deletePreviousFile(OldApplicationData, newDraftData);
  }
  const updatedData = {
    ...OldApplicationData,
    ...newDraftData,
  };

  console.log(updatedData, "UPDATE DATA");
  console.log(filter, "FILTER");

  const updateDoc = {
    $set: updatedData,
  };

  const result = await updateDraftApp(filter, updateDoc);

  return res.send(result);
};

const deleteSingleDraftApp = async (req, res) => {
  const { applicationNo, userID } = req.body;

  console.log(applicationNo, userID);

  const query = {
    userId: userID,
    applicationNo,
  };

  const removeApplication = await removeSingleDraftApp(query);

  return res.send(removeApplication);
};

const deleteDraftAppAndInsertIntoSubmit = async (req, res) => {
  const data = JSON.parse(req.query.data);
  console.log("Data:", data);

  const { userId, applicationNo } = data;

  console.log(userId, "UserId");

  const findApplication = await findDraftAppByQuery(data);

  console.log(findApplication);

  const date = new Date();

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  const submitDate = `${day}-${month}-${year}`;

  //   insert into submit collection
  await insertSubmitApp({
    ...findApplication,
    submitDate,
    status: "Pending at PS",
  });

  const resultOfDeleteData = await removeSingleDraftApp({
    userId,
    applicationNo,
  });

  console.log(resultOfDeleteData);

  return res.send(resultOfDeleteData);
};

module.exports = {
  getDraftAppByUserId,
  getAllDraftApps,
  addDraftApp,
  handleUpdateDraftApp,
  deleteSingleDraftApp,
  deleteDraftAppAndInsertIntoSubmit,
};
