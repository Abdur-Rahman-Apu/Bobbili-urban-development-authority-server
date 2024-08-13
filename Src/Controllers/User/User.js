const { ObjectId } = require("mongodb");
const {
  updateUserInfo,
  findUserByUserId,
  getAllUsers,
  insertUser,
  deleteUser,
} = require("../../Services/DBQueries/DbQueries");
const { authorize } = require("../../Configs/StorageOptions");
const {
  deleteGoggleDriveFile,
} = require("../../Services/ManageCloudStorage/ManageCloudStorage");

const handleGetAllUser = async (req, res) => {
  const result = await getAllUsers();
  return res.send(result);
};

const handleGetUser = async (req, res) => {
  const userId = req.query.userId;
  console.log(userId, "user ID");

  const result = await findUserByUserId(userId);

  console.log(result);

  if (result) {
    const { _id, role, userId, password, name, gender, isLoggedIn } = result;

    const userInfo = {
      _id,
      role,
      userId,
      name,
      gender,
      isLoggedIn,
    };

    if (role?.toLowerCase() === "ps") {
      userInfo["handOver"] = result?.handOver;
      userInfo["signId"] = result?.signId;
    }

    return res.send({
      status: 1,
      userInfo,
    });
  } else {
    return res.send({
      status: 0,
    });
  }
};

const handleGetUserDetails = async (req, res) => {
  const userId = req.query.userId;
  console.log(userId, "userId");

  const result = await findUserByUserId(userId);
  return res.send(result);
};

const handleReverseLoggedInFlag = async (req, res) => {
  const userId = JSON.parse(req.query.userId);
  console.log(userId, "id");
  const filter = { _id: new ObjectId(userId) };
  const updateDoc = {
    $set: { isLoggedIn: 0 },
  };
  const result = await updateUserInfo(filter, updateDoc);

  return res.send(result);
};

const handleHandoverByPs = async (req, res) => {
  const id = JSON.parse(req.query.id);
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: { handOver: "true" },
  };
  const result = await updateUserInfo(filter, updateDoc);
  return res.send(result);
};

const handleAddUser = async (req, res) => {
  const userInfo = req.body;

  console.log(userInfo);

  const findSameIdPerson = await findUserByUserId(userInfo?.userId);
  console.log(findSameIdPerson);

  if (findSameIdPerson) {
    return res.send({
      result: 0,
      message: "User id already exist",
    });
  } else {
    const result = await insertUser(userInfo);
    return res.send(result);
  }
};

const handleUpdateUser = async (req, res) => {
  const id = req.params.id;

  const { data, isPsSigned, signId } = req.body;

  console.log(id, data);

  if (data?.role.toLowerCase() === "ps" && isPsSigned) {
    authorize().then((authClient) => deleteGoggleDriveFile(authClient, signId));
  }

  // if (data?.role?.toLowerCase() === "ps") {
  //   data["handOver"] = data?.handOver === "true" ? true : false;
  // }

  const filter = { _id: new ObjectId(id) };

  const updateDoc = {
    $set: {
      ...data,
    },
  };

  console.log(updateDoc);

  const result = await updateUserInfo(filter, updateDoc);

  return res.send(result);
};

const handleDeleteUser = async (req, res) => {
  const userId = req.params.id;
  console.log(userId);

  const query = { _id: new ObjectId(userId) };

  const result = await deleteUser(query);

  return res.send(result);
};

module.exports = {
  handleGetAllUser,
  handleReverseLoggedInFlag,
  handleHandoverByPs,
  handleGetUser,
  handleGetUserDetails,
  handleAddUser,
  handleUpdateUser,
  handleDeleteUser,
};
