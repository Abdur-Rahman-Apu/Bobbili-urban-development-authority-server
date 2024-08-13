const {
  findRejectedAppUsingUserId,
} = require("../../Services/DBQueries/DbQueries");

const getRejectedAppByUserId = async (req, res) => {
  const userId = req?.query?.userId;

  console.log(userId, "User id");
  const result = await findRejectedAppUsingUserId(userId);

  console.log(result, "Rejected");
  return res.send(result);
};

module.exports = { getRejectedAppByUserId };
