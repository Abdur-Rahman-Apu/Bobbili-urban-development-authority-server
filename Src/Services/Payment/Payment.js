const crypto = require("crypto");
const { updatePayment } = require("../DBQueries/DbQueries");

function generateUniqueID() {
  const date = new Date();
  const timestamp = Date.now(); // Current timestamp
  const randomComponent = Math.floor(Math.random() * 1000000); // Random number
  const uniqueID = `order_${timestamp}_${randomComponent}_${date.getDate()}_${
    date.getMonth() + 1
  }_${date.getFullYear()}`;
  return uniqueID;
}

// function encrypt(plainText, workingKey) {
//   console.log(plainText, workingKey, "encrypt");
//   var m = crypto.createHash("md5");
//   m.update(workingKey);
//   console.log(m, "m");
//   var key = m.digest("binary");
//   var iv = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
//   console.log(key, "k");
//   var cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
//   console.log(cipher, "c");
//   var encoded = cipher.update(plainText, "utf8", "hex");
//   console.log(encoded, "e");
//   encoded += cipher.final("hex");
//   console.log(encoded, "e1");
//   return encoded;
// }

// function decrypt(encText, workingKey) {
//   var m = crypto.createHash("md5");
//   m.update(workingKey);
//   var key = m.digest("binary");
//   var iv = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
//   var decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
//   var decoded = decipher.update(encText, "hex", "utf8");
//   decoded += decipher.final("utf8");
//   return decoded;
// }

function encrypt(plainText) {
  // Convert the working key from hex to a Buffer
  // const key = Buffer.from(workingKey, "hex");

  // // Initialization vector
  // const iv = Buffer.from([
  //   0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
  //   0x0c, 0x0d, 0x0e, 0x0f,
  // ]);

  // // Create cipher
  // const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  // let encrypted = cipher.update(plainText, "utf8", "hex");
  // encrypted += cipher.final("hex");

  // return encrypted;
  // var m = crypto.createHash("md5");
  // m.update(workingKey);
  // var key = m.digest(); // This will be a buffer
  // var iv = Buffer.from([
  //   0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
  //   0x0c, 0x0d, 0x0e, 0x0f,
  // ]); // IV as a buffer
  // var cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  // var encoded = cipher.update(plainText, "utf8", "hex");
  // encoded += cipher.final("hex");
  // return encoded;

  console.log(plainText, "plain text");

  console.log(process.env.ENC_KEY, "key");
  const outputEncoding = "base64";
  const cipher = crypto.createCipheriv(
    "aes-128-ecb",
    process.env.ENC_KEY,
    null
  );
  return Buffer.concat([cipher.update(plainText), cipher.final()]).toString(
    outputEncoding
  );
}

function decrypt(encText, workingKey) {
  // Convert the working key from hex to a Buffer
  // const key = Buffer.from(workingKey, "hex");

  // // Initialization vector
  // const iv = Buffer.from([
  //   0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
  //   0x0c, 0x0d, 0x0e, 0x0f,
  // ]);

  // // Create decipher
  // const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  // let decrypted = decipher.update(encryptedText, "hex", "utf8");
  // decrypted += decipher.final("utf8");

  // return decrypted;
  var m = crypto.createHash("md5");
  m.update(workingKey);
  var key = m.digest(); // This will be a buffer
  var iv = Buffer.from([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]); // IV as a buffer
  var decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  var decoded = decipher.update(encText, "hex", "utf8");
  decoded += decipher.final("utf8");
  return decoded;
}

const updatePaymentStatus = async (data, page) => {
  const query = { order_id: data?.order_id, message: "initial" };
  const updateDoc = {
    $set: { ...data },
  };
  await updatePayment(query, updateDoc);
};

module.exports = { generateUniqueID, encrypt, decrypt, updatePaymentStatus };
