const { authorize } = require("../../Configs/StorageOptions");
const {
  findShortfallAppUsingAppNo,
  allShortfallApps,
  insertSubmitApp,
  deleteShortfallApp,
} = require("../../Services/DBQueries/DbQueries");
const {
  deleteGoggleDriveFile,
} = require("../../Services/ManageCloudStorage/ManageCloudStorage");

const getSpecificShortfallApp = async (req, res) => {
  const appNo = JSON.parse(req.query.appNo);
  const result = await findShortfallAppUsingAppNo(appNo);
  return res.send(result);
};

const getShortfallSerialNo = async (req, res) => {
  const allShortfallApp = await allShortfallApps();
  if (allShortfallApp.length) {
    let max = -999;
    allShortfallApp.forEach((app) => {
      if (app.shortfallSerialNo > max) {
        max = app.shortfallSerialNo;
      }
    });
    return res.send({ shortfallSerialNo: max });
  } else {
    return res.send({ shortfallSerialNo: 1 });
  }
};

const handleResubmitShortfallApp = async (req, res) => {
  const { oldImageFiles, appNo } = JSON.parse(req?.query?.data);

  // delete previous image files from the google drive
  oldImageFiles.length &&
    oldImageFiles.forEach((fileId) => {
      if (fileId.length) {
        authorize().then((authClient) =>
          deleteGoggleDriveFile(authClient, fileId)
        );
      }
    });

  const needToStoreData = req.body;

  const updateDoc = {
    $set: needToStoreData,
  };

  const query = { applicationNo: appNo };

  const result = await updateShortfallApp(query, updateDoc);

  if (result?.acknowledged) {
    const findApplication = await findShortfallAppUsingAppNo(appNo);

    delete findApplication["_id"];
    delete findApplication["psDocumentPageObservation"];
    delete findApplication["psDrawingPageObservation"];
    delete findApplication["siteInspection"];
    delete findApplication["psId"];
    delete findApplication["psSubmitDate"];
    delete findApplication["shortfallSerialNo"];

    // insert into submit app collection
    await insertSubmitApp(findApplication);

    //  remove from the shortfall app collection
    await deleteShortfallApp({ applicationNo: appNo });

    return res.send(result);
  }
};
module.exports = {
  getSpecificShortfallApp,
  getShortfallSerialNo,
  handleResubmitShortfallApp,
};
