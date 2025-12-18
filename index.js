const express = require("express");
const logger = require("morgan");
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./auth/auth");
const chatRoutes = require("./chat/chat");
const socketAuth = require("./socket/socketMiddleware");
const createSocket = require("./socket");

const PORT = 5999;
const app = express();
const server = http.createServer(app);

createSocket(server);

app.use(logger("dev"));
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

app.get("/", (_, res) => {
  res.send("Servidor funcionando correctamente");
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
