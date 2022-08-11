const mongoose = require("mongoose");
const Chats = require("../../models/chat");
// API FOR CHAT

const saveChat = (data, socket) => {
  // console.log("chat", data);
  const chatMessage = data.text;
  Chats.create({ text: chatMessage, chatRoom: data.chatRoom })
    .then((chat) => {
      // console.log("chat", chat);
      // console.log("room name", data.chatRoom);
      socket.to(data.chatRoom).emit("chat", chat);
    })
    .catch((err) => {
      console.log(err);
    });
};
const fetchChat = (data, socket) => {
  // console.log("chat", data);
  Chats.find({ chatRoom: data.chatRoom })
    .then((chat) => {
      // console.log("chat", chat);
      socket.to(data.chatRoom).emit("joinChatRoom", chat);
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports = {
  saveChat,
  fetchChat,
};
