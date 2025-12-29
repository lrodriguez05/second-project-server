const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db"); // Turso client

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute({
      sql: "INSERT INTO users (username, password) VALUES (?, ?)",
      args: [username, hashedPassword],
    });

    res.json({ message: "Usuario creado con éxito" });
  } catch (error) {
    // Manejo de duplicados
    if (error.code === "SQLITE_CONSTRAINT") {
      return res
        .status(409)
        .json({ message: "Ese nombre de usuario ya está en uso" });
    }
    console.error(error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ?",
      args: [username],
    });

    const user = result.rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ message: "Usuario o contraseña incorrecta" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({
        message: "Login exitoso",
        token,
        id: user.id,
        username: user.username,
      });
    } else {
      res.status(404).json({ message: "Usuario o contraseña incorrecta" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en la base de datos" });
  }
});

module.exports = router;
