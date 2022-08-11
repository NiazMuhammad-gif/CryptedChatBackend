const express = require("express");

const router = express.Router();

router.use("/api/chat", require("./chat/router"));
// HANDLING UNKNOW REQUEST
router.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

module.exports = router;
