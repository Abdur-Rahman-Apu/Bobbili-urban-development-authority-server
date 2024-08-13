const { google } = require("googleapis");
const stream = require("stream");
const mime = require("mime-types");

async function downloadFile(authClient, fileName, fileId, res) {
  const drive = google.drive({ version: "v3", auth: authClient });

  if (fileName && fileId) {
    const fileStream = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );

    if (fileStream) {
      res.setHeader("Content-disposition", `attachment; filename=${fileName}`);
      res.setHeader("Content-type", "application/octet-stream");
      fileStream.data
        .on("end", () => {
          console.log("Done.");
          // Send a success message to the client

          // res.status(200).json({ message: "File downloaded successfully" });
        })
        .on("error", (err) => {
          console.log(err);

          // res.status(500).json({ message: "Error downloading the file" });
        })
        .pipe(res);

      // Set the response headers for the file download
    } else {
      console.log("Failed to retrieve file stream.");
      return res
        .status(500)
        .json({ message: "Failed to retrieve file stream" });
    }
  } else {
    console.log("Please specify file name/file id");
    return res
      .status(400)
      .json({ message: "Please specify file name/file id" });
  }
}

const uploadFile = async (authClient, fileObject, folderId) => {
  const bufferStream = new stream.PassThrough();

  console.log(fileObject, "FILE OBJECT");

  bufferStream.end(fileObject.buffer);

  const { data } = await google
    .drive({ version: "v3", auth: authClient })
    .files.create({
      media: {
        mimeType: fileObject.mimeType,
        body: bufferStream,
      },
      requestBody: {
        name: fileObject.originalname,
        parents: [folderId],
      },
      fields: "id,name",
    });
  console.log(`Uploaded file ${data.name} ${data.id}`);

  return data.id;
};

const deleteGoggleDriveFile = async (authClient, fileId) => {
  const drive = google.drive({ version: "v3", auth: authClient }); // Authenticating drive API

  // Deleting the image from Drive
  drive.files.delete({
    fileId: fileId,
  });
};

const deletePreviousFile = (oldData, newData) => {
  let fileIdArr = [];

  console.log("ASLAM");

  console.log(oldData, "OldData");
  console.log(newData, "NEW DATA");

  if (newData.documents) {
    // const extractOldData = Object.values(oldData.documents);
    // const extractNewData = Object.values(newData.documents);

    function checkExistImageId(extractOldData, extractNewData) {
      extractNewData.forEach((newValue) => {
        extractOldData?.forEach((oldValue) => {
          if (
            oldValue?.id === newValue?.id &&
            oldValue?.imageId !== newValue?.imageId
          ) {
            fileIdArr.push(oldValue?.imageId);
          }
        });
      });
    }

    const extractOldDefaultData = oldData?.documents?.default;
    const extractNewDefaultData = newData?.documents?.default;

    checkExistImageId(extractOldDefaultData, extractNewDefaultData);

    const extractOldDynamicData = oldData?.documents?.dynamic;
    const extractNewDynamicData = newData?.documents?.dynamic;

    checkExistImageId(extractOldDynamicData, extractNewDynamicData);
  }

  if (newData.drawing) {
    console.log(oldData.drawing, "OLD DATA");
    const extractOldData = Object.values(oldData.drawing);
    const extractNewData = Object.values(newData.drawing);

    fileIdArr = extractOldData.filter(
      (old, index) => old !== extractNewData[index]
    );

    console.log(fileIdArr, "DELETE FILE ID OF DRAWING");
  }

  // FOR PAYMENT OLD IMAGE FILES
  if (newData.payment) {
    const oldDGramaFee =
      oldData?.payment?.gramaPanchayatFee?.gramaBankReceipt ?? "";
    const oldLabourCharge =
      oldData?.payment?.labourCessCharge?.labourCessBankReceipt ?? "";
    const oldGreenFee =
      oldData?.payment?.greenFeeCharge?.greenFeeBankReceipt ?? "";

    if (
      newData?.payment?.gramaPanchayatFee?.gramaBankReceipt !== oldDGramaFee
    ) {
      fileIdArr.push(oldDGramaFee);
    }
    if (
      newData?.payment?.labourCessCharge?.labourCessBankReceipt !==
      oldLabourCharge
    ) {
      fileIdArr.push(oldLabourCharge);
    }
    if (newData?.payment?.greenFeeCharge?.greenFeeBankReceipt !== oldGreenFee) {
      fileIdArr.push(oldGreenFee);
    }

    console.log(fileIdArr, "PAYMENT");
  }

  fileIdArr.length &&
    fileIdArr.forEach((fileId) => {
      if (fileId.length) {
        authorize().then((authClient) =>
          deleteGoggleDriveFile(authClient, fileId)
        );
      }
    });
};

module.exports = {
  downloadFile,
  uploadFile,
  deleteGoggleDriveFile,
  deletePreviousFile,
};
