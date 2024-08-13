const { visitorCountCollection } = require("../../Models/collections");

const getVisitorAmount = async (req, res) => {
  const result = await visitorCountCollection.find({}).toArray();
  return res.send(result);
};

module.exports = { getVisitorAmount };
