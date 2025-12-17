const express = require("express");
const logger = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./auth/auth");
const chatRoutes = require("./chat/chat");
const socketAuth = require("./auth/socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const PORT = 5999;

socketAuth(io);

// Middleware
app.use(logger("dev"));
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

// Ruta de prueba
app.get("/", (_, res) => {
  res.send("Servidor funcionando correctamente");
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
