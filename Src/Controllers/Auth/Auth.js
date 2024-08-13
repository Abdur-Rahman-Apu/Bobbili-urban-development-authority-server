const { ObjectId } = require("mongodb");
const { baseUrl } = require("../../Configs/BaseUrl");
const axios = require("axios");
const {
  userCollection,
  visitorCountCollection,
} = require("../../Models/collections");
const { cookieOptions } = require("../../Configs/CookieOptions");

const handleLogin = async (req, res) => {
  const { id, password } = JSON.parse(req.query.credentials);

  const userInfo = await userCollection.findOne({ userId: id });

  // if no user found
  if (!userInfo) {
    return res.status(404).send({ message: "User not found" });
  }

  //CHECK:: if user is ps then checking he removed or not
  if (
    userInfo?.role?.toLowerCase() === "ps" &&
    userInfo?.handOver.toString() === "true"
  ) {
    return res.status(404).send({ message: "You handOvered your credentials" });
  }

  // checking user is already active or not
  if (userInfo?.isLoggedIn) {
    return res.status(404).send({ message: "User is already active" });
  }

  // checking password is matched or not
  const isMatchPassword = userInfo.password === password;

  if (!isMatchPassword) {
    return res.status(404).send({ message: "Password is incorrect" });
  }

  const { _id, role, userId, name, gender, isLoggedIn } = userInfo;

  const storeInfo = {
    _id,
    role,
    userId,
    name,
    gender,
    isLoggedIn,
  };

  if (role?.toLowerCase) {
    storeInfo["handOver"] = userInfo?.handOver;
    storeInfo["signId"] = userInfo?.signId;
  }

  // set token into the cookie

  const response = await axios.post(`${baseUrl}/jwt`, storeInfo);

  console.log(response, "response");
  const resultOfJWT = response?.data;

  if (resultOfJWT?.success) {
    res.cookie("jwToken", JSON.stringify(resultOfJWT?.token), cookieOptions);
  }

  // update logged user amount
  const updateDoc = {
    $set: { isLoggedIn: 1 },
  };

  const filter = { _id: new ObjectId(userInfo?._id) };

  await userCollection.updateOne(filter, updateDoc);

  await visitorCountCollection.updateOne(
    { _id: new ObjectId("65886ee5b7ea9902499d4dca") },
    { $inc: { count: 1 } }
  );

  // return response to the client
  return res.send({ status: 1, message: "User found", userInfo: storeInfo });
};

module.exports = { handleLogin };
