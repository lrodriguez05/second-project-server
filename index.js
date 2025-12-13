const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./auth/auth");

const app = express();
const PORT = 5999;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

// Ruta de prueba
app.get("/", (_, res) => {
  res.send("Servidor funcionando correctamente");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
