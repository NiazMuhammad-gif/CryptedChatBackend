const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const socketIO = require("socket.io");
// const morgan = require("morgan");
const dotenv = require("dotenv");
// const HttpError = require("./src/models/http-error");
// var siofu = require("socketio-file-upload");
dotenv.config();
const connection = require("./src/database/db");
// const fileupload = require("express-fileupload");

const socket = require("./socket");

connection();

// SETTING UP EXPRESS
const app = express();
// SETTING UP PORT
const port = process.env.PORT || 4000;

// SETTING UP MORGAN
// app.use(morgan("dev"));
// app.use(siofu.router);
// app.use(fileupload({ useTempFiles: true }));

// SETTING UP BODYPARSER
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));

// SETTING UP CORS
app.use(cors({ origin: "*" }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// SETTING UP SERVER UPLOADS
app.use(express.static("/"));
app.use("/uploads", express.static("uploads"));
app.use("/vms", express.static("vms"));

//SETTING UP ROUTES
app.use("/", require("./src/routes/routes"));
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// SERVER CREATED
const server = http.createServer(app);

// SETTING UP SOCKET.IO
const io = socketIO(server);
socket(io);
// LISTENING TO SERVER ON PORT 4000
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
