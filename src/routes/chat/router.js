const express = require("express");

const router = express.Router();

module.exports = router;

// HANDLING UNKNOW REQUEST

router.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

module.exports = router;
