const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const mime = require("mime-types");
const http = require("http");
const { connectMongoDB } = require("./Src/Configs/ConnectDB");
const { corsOptions } = require("./Src/Configs/CorsOptions");
const { performCornJob } = require("./Src/Services/CornJob/CornJob");
const { realTimeCommunication } = require("./Src/Services/SocketIo/SocketIo");

// Roters
const JwtRouter = require("./Src/Routes/JWT");
const GoogleDriveRouter = require("./Src/Routes/GoogleDrive");
const DistrictRouter = require("./Src/Routes/Districts");
const VisitorRouter = require("./Src/Routes/VisitorCount");
const AuthRouter = require("./Src/Routes/Auth");
const UserRouter = require("./Src/Routes/User");
const AppsRouter = require("./Src/Routes/Apps");
const DraftAppRouter = require("./Src/Routes/DraftApp");
const RejectedAppRouter = require("./Src/Routes/RejectedApp");
const ApprovedAppRouter = require("./Src/Routes/ApprovedApp");
const ShortfallAppRouter = require("./Src/Routes/ShortfallApp");
const SubmitAppRouter = require("./Src/Routes/SubmitApp");
const SearchAppRouter = require("./Src/Routes/SearchApp");
const ForgotPassOtpRouter = require("./Src/Routes/ForgotPassOtp");
const PsSignOtpRouter = require("./Src/Routes/PsSignOtp");
const MessageRouter = require("./Src/Routes/Message");
const PaymentRouter = require("./Src/Routes/Payment");

require("dotenv").config();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);

// mongodb connection
connectMongoDB().then(() => {
  console.log("Mongodb connected");
});

console.log(process.env.CLIENT_EMAIL, "client email");
console.log(process.env.GD_PRIVATE_KEY, "private key");
console.log(mime.contentType("example.DWG"));

const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  // console.log(res, "response");
  if (req.originalUrl.includes("drive")) {
    res.header("Access-Control-Allow-Origin", "*");
  }
  next();
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/jwt", JwtRouter);

app.use("/visitorAmount", VisitorRouter);

app.use("/auth", AuthRouter);

app.use("/user", UserRouter);

app.use("/storage", GoogleDriveRouter);

app.use("/districts", DistrictRouter);

app.use("/apps", AppsRouter);

app.use("/rejectedApp", RejectedAppRouter);

app.use("/draftApp", DraftAppRouter);

app.use("/approvedApp", ApprovedAppRouter);

app.use("/shortfallApp", ShortfallAppRouter);

app.use("/submitApp", SubmitAppRouter);

app.use("/searchApp", SearchAppRouter);

app.use("/forgotPassOtp", ForgotPassOtpRouter);

app.use("/psSignOtp", PsSignOtpRouter);

app.use("/message", MessageRouter);

app.use("/payment", PaymentRouter);

server.listen(port, () => {
  console.log("Server is running on port ", port);
});

//   // socket io
realTimeCommunication(server);

//corn job
performCornJob();

// Export the Express API
module.exports = app;
