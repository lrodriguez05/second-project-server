const Chat = require("../chat/chat-class");
const db = require("../db");

function eventMessage(socket, io) {
  socket.on("message", async (message) => {
    try {
      const chat = new Chat();
      const sended = await chat.sendMessage(
        message.chatId,
        socket.user.username,
        message.message
      );

      const room = `chat:${message.chatId}`;

      io.to(room).emit(room, sended);
    } catch (e) {
      console.log(e);
      socket.emit("error", { message: e.message });
    }
  });
}

function eventJoin(socket) {
  socket.on("join-chat", (chatId) => {
    socket.join(`chat:${chatId}`);
  });

  socket.on("leave-chat", (chatId) => {
    socket.leave(`chat:${chatId}`);
  });
}

module.exports = { eventMessage, eventJoin };
