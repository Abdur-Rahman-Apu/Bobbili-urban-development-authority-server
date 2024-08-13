const { authorize } = require("../../Configs/StorageOptions");
const axios = require("axios");
const fetch = require("node-fetch");
const {
  downloadFile,
  uploadFile,
} = require("../../Services/ManageCloudStorage/ManageCloudStorage");

const handleDownloadFile = async (req, res) => {
  const { fileName, fileId } = JSON.parse(req.query.data);
  console.log(fileName, fileId);
  authorize().then((authClient) =>
    downloadFile(authClient, fileName, fileId, res)
  );
};

const handleUploadFile = async (req, res) => {
  // Access uploaded file via req.file

  const pages = {
    document: "1xfk1StJ2AscqxDDoLwNj3tPRUS_dLpw5",
    drawing: "1wRElw-4faLOZWQjV4dzcQ2lHG-IhMhQd",
    payment: "1pWE9tZrfsjiZxNORP5ZwL7Bm72S7JKpY",
    siteInspection: "1uVuXJz9kfWXyAg5ENfEiWL2qfDtCMa_Z",
    approvedDocSignedPS: "1QCF6Cj1p_UG7xAx_JY0fTaQgzjKXWOAH",
    shortfallDocSignedPS: "1EdI3-srZgY-aodMIJJtD0BDPwCrSsD9K",
    sign: "1ZbWRCY-HDOrfObNNEfqo1Fxunsx3cyAh",
  };

  console.log("Aschi");
  const file = req.file;

  const page = req.query.page;

  const folderId = pages[page];

  console.log(folderId, file, page);

  // console.log(file);
  if (!file) {
    return res.status(400).send({ msg: "No file uploaded." });
  }

  authorize()
    .then((authClient) => uploadFile(authClient, file, folderId))
    .then((result) => {
      console.log(result, "RESPONSE");
      return res.send({ msg: "Successfully uploaded", fileId: result });
    })
    .catch((err) => {
      console.log(err);
      return res.send({ msg: "Something went wrong" });
    });
};

const handleGetPdf = async (req, res) => {
  try {
    const fileId = req.query.fileId;
    console.log(fileId, "file id");
    if (!fileId) {
      return res.status(400).send("File ID is required.");
    }

    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await axios.get(url, { responseType: "stream" });
    console.log(response, "response in pdf");

    // Forward response from Google Drive to the client
    return response.data.pipe(res);
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return res.status(500).send("Internal server error");
  }
};

const handleProxyImage = async (req, res) => {
  try {
    const imageUrl = req.query.url;
    const response = await fetch(imageUrl);
    const imageBuffer = await response.buffer();
    res.set("Content-Type", response.headers.get("Content-Type"));
    return res.send(imageBuffer);
  } catch (error) {
    console.error("Error fetching image:", error);
    return res.status(500).send("Internal server error");
  }
};

const handleGetImage = async (req, res) => {
  try {
    const imageUrl = req.query.url;
    const response = await fetch(imageUrl);
    const imageData = await response.blob();
    return res.send(imageData);
  } catch (error) {
    console.error("Error fetching image:", error);
    return res.status(500).send("Internal server error");
  }
};

module.exports = {
  handleDownloadFile,
  handleUploadFile,
  handleGetPdf,
  handleProxyImage,
  handleGetImage,
};
