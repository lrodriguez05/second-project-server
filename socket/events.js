const Chat = require("../chat/chat-class");

function eventMessage(socket, io) {
  socket.on("message", async (message) => {
    try {
      const chat = new Chat();

      // Enviar mensaje y guardarlo en Turso
      const sended = await chat.sendMessage(
        message.chatId,
        socket.user.username,
        message.message
      );

      const room = `chat:${message.chatId}`;

      const sendedSafe = {
        ...sended,
        message_id: sended.message_id.toString(),
        chat_id: sended.chat_id.toString(),
      };

      io.to(room).emit(room, sendedSafe);
    } catch (e) {
      console.log("Error en eventMessage:", e);
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
