const { saveChat, fetchChat } = require("./src/controllers/chat");

const socket = (io) => {
  // ON CONNECTION EVENT
  io.on("connection", (socket) => {
    console.log("client connected on websocket");

    socket.on("joinChatRoom", (data) => {
      console.log("joinChatRoom", data);
      socket.join(data.chatRoom);
      fetchChat(data, io);
    });

    socket.on("chat", (data) => {
      if (io.sockets.adapter.rooms.has(data.chatRoom)) {
        saveChat(data, io);
      } else {
        socket.join(data.chatRoom);
        saveChat(data, io);
      }
    });

    // ON DISSCONNECT EVENT
    socket.on("disconnect", () => {
      console.log("client disconnected on websocket");
      socket.leave();
    });
  });
};

module.exports = socket;
