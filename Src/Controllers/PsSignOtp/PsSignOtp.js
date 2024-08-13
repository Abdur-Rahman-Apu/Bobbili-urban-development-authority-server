const {
  insertPsSignOtp,
  deletePsSignOtp,
  findPsSignOtp,
} = require("../../Services/DBQueries/DbQueries");

const handleInsertPsSignOtp = async (req, res) => {
  console.log(req.body);
  const { psId, otp } = req.body;

  // delete previous stored otp
  await deletePsSignOtp({ psId });

  const result = await insertPsSignOtp({ psId, otp });
  return res.send(result);
};

const handleMatchPsSignOtp = async (req, res) => {
  const { psId, otp } = JSON.parse(req.query.data);
  const findUser = await findPsSignOtp({ psId });
  if (findUser?.otp === otp) {
    return res.send({ otpMatched: 1 });
  } else {
    return res.send({ otpMatched: 0 });
  }
};

module.exports = { handleInsertPsSignOtp, handleMatchPsSignOtp };
