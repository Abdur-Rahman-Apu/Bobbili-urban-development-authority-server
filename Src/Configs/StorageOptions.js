const apiKeys = require("../../apikeys.json");
const { google } = require("googleapis");
require("dotenv").config();
console.log(process.env.CLIENT_EMAIL, "client email storage option");
console.log(process.env.GD_PRIVATE_KEY, "private key storage option");
const SCOPE = ["https://www.googleapis.com/auth/drive"];
// A Function that can provide access to google drive api
async function authorize() {
  const jwtClient = new google.auth.JWT(
    apiKeys.client_email,
    null,
    apiKeys.private_key,
    SCOPE
  );
  // const jwtClient = new google.auth.JWT(
  //   `${process.env.CLIENT_EMAIL}`,
  //   null,
  //   `${process.env.GD_PRIVATE_KEY}`,
  //   SCOPE
  // );

  await jwtClient.authorize();
  return jwtClient;
}

module.exports = { authorize };
