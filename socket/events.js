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

      const chatEvent = `chat:${message.chatId}`;

      io.emit(chatEvent, sended);
    } catch (e) {
      console.log(e);
      socket.emit("error", { message: e.message });
    }
  });
}

module.exports = eventMessage;
