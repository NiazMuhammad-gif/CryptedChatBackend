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

// generate public key

let p = 11;
let q = 13;

let n = p * q;

console.log("n", n);

let t = (p - 1) * (q - 1);

console.log("totient function", t);

function gcd_two_numbers(x, y) {
  if (typeof x !== "number" || typeof y !== "number") return false;
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    var t = y;
    y = x % y;
    x = t;
  }
  return x;
}
// get array of prime numbers
function primeFactorsTo(max) {
  var store = [],
    i,
    j,
    primes = [];
  for (i = 2; i <= max; ++i) {
    if (!store[i]) {
      primes.push(i);
      for (j = i << 1; j <= max; j += i) {
        store[j] = true;
      }
    }
  }
  return primes;
}

// console.log(primeFactorsTo(t));
let primeArray = primeFactorsTo(t);
let e;
for (let i = 2; i < primeArray.length; i++) {
  let cc = gcd_two_numbers(primeArray[i], t);
  if (cc == 1) {
    e = primeArray[i];
    break;
  }
}
// Assume e such that gcd(e,t)==1 & 1<e<t
// e = 7

console.log("e", e);

// find d

// d * e mod t = 1
let d;
for (let j = 2; j < 10000; j++) {
  if ((j * e) % t == 1) {
    d = j;
    break;
  }
}
console.log("d", d);
// const findCoPrime = (num1) => {
//     let coPrimeNumber;
//   const smaller = num1;
//   for(let ind = 2; ind < smaller; ind++){
//       const condition1 = num1 % ind === 0;
//       if(condition1){
//           console.log(condition1,ind)
//          return false;
//       };
//   };
//   return true;
// };

// encryption
// message == hill key

let message = 55;
console.log("message = ", message);
console.log(">>>>>>>>> ENCRYPTION<<<<<<<<<");
let c = Math.pow(message, e) % n;
console.log("encrypted text C = ", c);

console.log(">>>>>>>>> DECRYPTION<<<<<<<<<");
let M = Math.pow(c, d) % n;
console.log("Message M = ", M);

// console.log("e",)
