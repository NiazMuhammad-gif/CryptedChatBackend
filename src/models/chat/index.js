const mongoose = require("mongoose");

const Chats = new mongoose.Schema(
  {
    text: {
      type: String,
    },
    chatRoom: {
      type: String,
    },
    encryptedKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chats", Chats);
