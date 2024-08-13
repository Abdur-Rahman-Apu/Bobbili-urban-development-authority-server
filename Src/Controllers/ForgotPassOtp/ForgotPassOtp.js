const {
  insertForgotPassOtp,
  findForgotPassOtpByUserId,
  updateUserInfo,
  deleteForgotPassOtp,
} = require("../../Services/DBQueries/DbQueries");

const handleAddOtpOfForgotPass = async (req, res) => {
  console.log(req.body);
  const { userId, otp } = req.body;
  const result = await insertForgotPassOtp({ userId, otp });
  return res.send(result);
};

const handleForgotPassOtpMatch = async (req, res) => {
  const { userId, otp, password } = JSON.parse(req.query.data);
  const findUser = await findForgotPassOtpByUserId({ userId });
  if (findUser?.otp === otp) {
    // update user password

    const filter = {
      userId,
    };

    const updateDoc = {
      $set: { password },
    };

    await updateUserInfo(filter, updateDoc);

    //  Delete the otp
    await deleteForgotPassOtp({ userId });

    return res.send({ otpMatched: 1 });
  } else {
    return res.send({ otpMatched: 0 });
  }
};

module.exports = { handleAddOtpOfForgotPass, handleForgotPassOtpMatch };
