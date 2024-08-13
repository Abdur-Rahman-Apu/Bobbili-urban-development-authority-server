const cookieOptions = {
  maxAge: 43200000, // cookie exist time 12 hour
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/",
};

module.exports = { cookieOptions };
