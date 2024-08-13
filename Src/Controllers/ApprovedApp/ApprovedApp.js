const {
  findApprovedAppUsingAppNo,
} = require("../../Services/DBQueries/DbQueries");

const getApprovedAppByAppNo = async (req, res) => {
  const appNo = JSON.parse(req.query.appNo);
  const result = await findApprovedAppUsingAppNo(appNo);
  return res.send(result);
};

module.exports = { getApprovedAppByAppNo };
