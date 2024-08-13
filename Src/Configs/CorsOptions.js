const corsOptions = {
  // origin: "http://localhost:5173", // Replace with your frontend domain
  origin: "https://bobbili-urban-development-authority.netlify.app",
  // Replace with your frontend domain
  credentials: true, // This is important to allow cookies to be sent
};

module.exports = { corsOptions };
