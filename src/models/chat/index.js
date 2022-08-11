const mongoose = require("mongoose");

const Chats = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    chatRoom: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chats", Chats);
