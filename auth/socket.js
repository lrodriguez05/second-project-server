const jwt = require("jsonwebtoken");

function socketAuth(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Token requerido"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.user.username);

    socket.on("disconnect", () => {
      console.log("Usuario desconectado:", socket.user.username);
    });
  });
}

module.exports = socketAuth;
