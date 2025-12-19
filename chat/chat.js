const express = require("express");
const router = express.Router();
const ChatGestor = require("./chat-class");
const authMiddleware = require("../auth/authMiddleware");

const chatGestor = new ChatGestor();

router.get("/chats/users", authMiddleware, async (req, res) => {
  try {
    const users = await chatGestor.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
});

router.post("/chats", authMiddleware, async (req, res) => {
  const { username } = req.user;
  const { otherUsername } = req.body;

  if (!otherUsername) {
    return res.status(400).json({ message: "otherUsername requerido" });
  }

  try {
    const chatId = await chatGestor.createChat(username, otherUsername);
    res.status(201).json({ chatId });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al crear el chat" });
  }
});

router.post("/chats/:chatId/messages", authMiddleware, async (req, res) => {
  const { chatId } = req.params;
  const { username } = req.user;
  const { content } = req.body;

  try {
    const message = await chatGestor.sendMessage(chatId, username, content);
    res.status(201).json(message);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al enviar el mensaje" });
  }
});

router.get("/chats/:chatId/messages", authMiddleware, async (req, res) => {
  const { chatId } = req.params;
  const { username } = req.user;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const messages = await chatGestor.getMessages(
      chatId,
      username,
      Number(limit),
      Number(offset)
    );
    res.json(messages);
  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al obtener mensajes" });
  }
});

router.get("/chats", authMiddleware, async (req, res) => {
  const { username } = req.user;

  try {
    const chats = await chatGestor.getChatsByUsername(username);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los chats" });
    console.log(error);
  }
});

router.get("/chats/:chatId/otherUser", authMiddleware, async (req, res) => {
  const { chatId } = req.params;
  const { username } = req.user;

  try {
    const otherUser = await chatGestor.getOtherUserInChat(chatId, username);
    res.json(otherUser);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo el otro usuario" });
  }
});

module.exports = router;
