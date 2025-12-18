const db = require("../db");
const { Server } = require("socket.io");
const socketAuth = require("./socketMiddleware");
const registerEvents = require("./register");

function createSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  socketAuth(io);

  io.on("connection", (socket) => {
    registerEvents(io, socket);
  });
}

module.exports = createSocket;
