const { ObjectId } = require("mongodb");
const {
  findMessagesById,
  deleteMessage,
  insertMessage,
  findMessagesByQuery,
  updateMessage,
} = require("../../Services/DBQueries/DbQueries");

const handleGetMessages = async (req, res) => {
  const id = req.query.id;

  const result = await findMessagesById(id);
  return res.send(result);
};

const handleRequestMessage = async (req, res) => {
  const data = req.body;
  console.log(data);

  const query = { userId: data.userId };

  const searchExistResult = await deleteMessage(query);

  console.log(searchExistResult, "Search result");

  if (searchExistResult.acknowledged) {
    const insertData = {
      text: [],
      chatEnd: 0,
      isAccepted: 0,
      acceptedBy: "",
      noResponse: { condition: false, query: "" },
      leave: false,
      timeUp: false,
      ...data,
    };
    const result = await insertMessage(insertData);
    return res.send(result);
  }
};

const handleNotAcceptedMessages = async (req, res) => {
  const query = {
    "noResponse.condition": false,
    isAccepted: 0,
    timeUp: false,
  };

  const result = await findMessagesByQuery(query);
  return res.send(result);
};

const handleUpdateMessage = async (req, res) => {
  console.log(req.query.update);
  const { id, action, acceptedBy, message } = JSON.parse(req.query.update);

  const findUser = await findMessagesById(id);

  let data;

  if (action === "accept") {
    data = {
      ...findUser,
      acceptedBy,
      isAccepted: 1,
      newTextFromCustomer: [],
    };
  }
  if (action === "timeUp") {
    data = { ...findUser, timeUp: true };
    console.log(data, "TIMEUP");
  }

  if (action === "requestAgain") {
    console.log(findUser, "FIND USER");
    data = {
      ...findUser,
      timeUp: false,
    };
  }

  if (action === "chatEnd") {
    data = { ...findUser, chatEnd: 1 };
  }
  if (action === "text") {
    findUser["text"].push(message);

    if (!message?.userId?.toLowerCase()?.includes("admin")) {
      findUser["newTextFromCustomer"].push(message?.message);
    }
    data = { ...findUser };
  }

  if (action === "leaveMessage") {
    data = { ...findUser, noResponse: { condition: true, query: message } };
  }

  if (action === "trackCustomerNewMessage") {
    findUser["newTextFromCustomer"] = [];
    data = { ...findUser };
  }

  if (action === "leaveFromTheMessage") {
    if ("leave" in findUser) {
      findUser["leave"] = true;
    }
    data = { ...findUser };
  }

  console.log(data, "AFTER UPDATED");
  const updatedDoc = {
    $set: { ...data },
  };

  const result = await updateMessage(query, updatedDoc);
  console.log(result);
  return res.send(result);
};

const handleDeleteMessage = async (req, res) => {
  const id = req.query.id;

  const query = { _id: new ObjectId(id) };

  const result = await deleteMessage(query);

  return res.send(result);
};

const handleMissedMessages = async (req, res) => {
  const query = { "noResponse.condition": true };
  const result = await findMessagesByQuery(query);
  return res.send(result);
};

const handleAcceptedMessages = async (req, res) => {
  const acceptedBy = JSON.parse(req.query.role);

  console.log(acceptedBy, "Accepted by");

  const query = { isAccepted: 1, acceptedBy };
  const result = await findMessagesByQuery(query);
  return res.send(result);
};

module.exports = {
  handleGetMessages,
  handleRequestMessage,
  handleNotAcceptedMessages,
  handleUpdateMessage,
  handleDeleteMessage,
  handleMissedMessages,
  handleAcceptedMessages,
};
