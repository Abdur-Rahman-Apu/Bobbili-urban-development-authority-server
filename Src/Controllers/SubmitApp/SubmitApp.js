const { authorize } = require("../../Configs/StorageOptions");
const {
  findSubmitAppsByQuery,
  findUserByUserId,
  findSubmitAppByAppNo,
  updateSubmitAppByPs,
  findSubmitAppByQuery,
  findShortfallAppsByQuery,
  deleteSubmitApp,
  deletePsSignOtp,
  insertShortfallApp,
  insertApprovedApp,
  insertRejectedApp,
} = require("../../Services/DBQueries/DbQueries");
const {
  deleteGoggleDriveFile,
} = require("../../Services/ManageCloudStorage/ManageCloudStorage");

const getAllSubmitAppByUserId = async (req, res) => {
  const userId = req.query.id;
  console.log(userId);

  const result = await findSubmitAppsByQuery({ userId });

  console.log(result);
  return res.send(result);
};

const getAllSubmitAppByPsInfo = async (req, res) => {
  const userId = req.query.userId;

  console.log(userId, "userId");
  const findPsInfo = await findUserByUserId(userId);

  console.log(findPsInfo, "psInfo");

  if (!findPsInfo) {
    return res.status(404).send("User not found");
  }

  const query = {
    "buildingInfo.generalInformation.district": findPsInfo?.district,
    "buildingInfo.generalInformation.mandal": findPsInfo?.mandal,
    "buildingInfo.generalInformation.gramaPanchayat":
      findPsInfo?.gramaPanchayat,
  };

  console.log(query, "Query");

  const result = await findSubmitAppsByQuery(query);

  console.log(result, "Result");
  return res.send(result);
};

const getSubmitAppByAppNo = async (req, res) => {
  const { appNo } = JSON.parse(req.query.appNo);

  console.log(appNo, "APPLICATION NO");

  const result = await findSubmitAppByAppNo(appNo);

  console.log(result, "Find");
  return res.send(result);
};

const handleUpdateSubmitAppByPs = async (req, res) => {
  // console.log(req.body, "req body");

  const appNo = req.query.appNo;

  const newData = req.body;
  console.log(newData);

  const findApplication = await findSubmitAppByAppNo(appNo);

  if (findApplication && newData?.siteInspection) {
    console.log("Aslam");
    const fileIdArr = [];
    const oldSiteBoundariesImageIds =
      findApplication?.siteInspection?.siteBoundaries
        ?.siteBoundariesImageFilesId;

    const newSiteBoundariesImageIds =
      newData?.siteInspection?.siteBoundaries?.siteBoundariesImageFilesId;

    console.log(oldSiteBoundariesImageIds, newSiteBoundariesImageIds);

    if (oldSiteBoundariesImageIds && newSiteBoundariesImageIds) {
      console.log("Aschi inside");
      for (const key in newSiteBoundariesImageIds) {
        if (oldSiteBoundariesImageIds[key] !== newSiteBoundariesImageIds[key]) {
          fileIdArr.push(oldSiteBoundariesImageIds[key]);
        }
      }
    }

    console.log(fileIdArr, "SITE INSPECTION FILE ID");

    fileIdArr.length &&
      fileIdArr.forEach((fileId) => {
        if (fileId.length) {
          authorize().then((authClient) =>
            deleteGoggleDriveFile(authClient, fileId)
          );
        }
      });
  }

  // console.log(findApplication, "Find application");

  let psSignedFiles;

  if (newData?.siteInspection) {
    const isShortfall =
      newData?.siteInspection?.decision?.toLowerCase() === "shortfall";
    if (isShortfall) {
      psSignedFiles = { endorsementFile: "" };
    } else {
      psSignedFiles = { proceedingFile: "", drawingFile: "" };
    }
  }

  const updateData =
    psSignedFiles === undefined
      ? { ...findApplication, ...newData }
      : { ...findApplication, ...newData, psSignedFiles };

  // console.log(findApplication, "findApplication");

  const updateDoc = {
    $set: updateData,
  };

  // console.log(oldDraftData[findExistingData]);
  // console.log(newDraftData);

  const result = await updateSubmitAppByPs(filter, updateDoc);

  return res.send(result);
};

const handleDecisionOfPs = async (req, res) => {
  const { applicationNo, trackPSAction, psId, psSignedFiles } = JSON.parse(
    req.query.data
  );

  console.log(req.query.data, "DECIsion");

  const filter = {
    applicationNo: applicationNo,
  };

  const findApplication = await findSubmitAppByQuery(filter);

  const date = new Date();

  const day = date.getDate().toString().padStart(2, "0");

  const month = (date.getMonth() + 1).toString().padStart(2, "0");

  const year = date.getFullYear();

  const psSubmitDate = `${day}-${month}-${year}`;

  const status =
    (trackPSAction === "reject" && "Rejected") ||
    (trackPSAction === "approved" && "Approved") ||
    (trackPSAction === "shortfall" && "Shortfall");

  console.log(status, "Status");

  let needToAdd;

  if (trackPSAction === "shortfall") {
    const allShortfallApplications = await findShortfallAppsByQuery({});

    let maxShortfallNo = 0;

    if (allShortfallApplications?.length > 0) {
      const allShortfallSerialNo = allShortfallApplications?.map(
        (eachApp) => eachApp?.shortfallNo
      );
      maxShortfallNo = Math.max(...allShortfallSerialNo);
    }

    needToAdd = {
      psSubmitDate,
      status,
      shortfallSerialNo: maxShortfallNo + 1,
      psId,
    };
  } else {
    needToAdd = { psSubmitDate, status, psId };
  }

  // check previous uploaded file is present or not
  const signedFilesId = findApplication["psSignedFiles"];

  for (const key in signedFilesId) {
    if (signedFilesId[key]?.length) {
      authorize().then((authClient) =>
        deleteGoggleDriveFile(authClient, signedFilesId[key])
      );
    }
  }

  const updateData = { ...findApplication, ...needToAdd, psSignedFiles };

  console.log(updateData, "updateDoc");
  const updateDoc = {
    $set: updateData,
  };

  const result = await updateSubmitAppByPs(filter, updateDoc);

  if (result.acknowledged) {
    const findApplication = await findSubmitAppByQuery(filter);

    console.log(findApplication, "AFTER SUBMITTED DATA");

    if (trackPSAction === "reject") {
      await insertRejectedApp(findApplication);
    } else if (trackPSAction === "approved") {
      await insertApprovedApp(findApplication);
    } else if (trackPSAction === "shortfall") {
      await insertShortfallApp(findApplication);
    }

    const deleteSubmittedData = await deleteSubmitApp(filter);

    // delete otp for ps sign
    await deletePsSignOtp({ psId });

    return res.send(deleteSubmittedData);
  } else {
    return res.send({ statusText: "Server Error" });
  }
};

module.exports = {
  getAllSubmitAppByUserId,
  getAllSubmitAppByPsInfo,
  getSubmitAppByAppNo,
  handleUpdateSubmitAppByPs,
  handleDecisionOfPs,
};
