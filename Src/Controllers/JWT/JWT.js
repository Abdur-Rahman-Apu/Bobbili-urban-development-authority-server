const { generateToken } = require("../../Services/JWT/JWT");

const handleJWT = async (req, res) => {
  const data = req.body;
  console.log(data, "JWT");
  const token = generateToken(data);
  const bearerToken = `bearer ${token}`;
  console.log(bearerToken, "Bearer token");

  // console.log(res.cookie(), "response cookie");
  return res.status(201).json({ success: true, token: bearerToken });
};

module.exports = { handleJWT };
