const db = require("../db");

class Chat {
  constructor() {
    this.db = db;
  }

  async getUsers() {
    const result = await this.db.execute({
      sql: `SELECT username, picture, description FROM users`,
    });
    return result.rows;
  }

  async sendMessage(chatId, username, content) {
    if (!content || !content.trim()) {
      throw { status: 400, message: "El mensaje no puede estar vacío" };
    }

    const check = await this.db.execute({
      sql: `
        SELECT 1
        FROM chats
        WHERE chat_id = ?
          AND (username1 = ? OR username2 = ?)
      `,
      args: [chatId, username, username],
    });

    if (check.rows.length === 0) {
      throw { status: 403, message: "No autorizado para este chat" };
    }

    const insert = await this.db.execute({
      sql: `
        INSERT INTO messages (chat_id, sender_username, content)
        VALUES (?, ?, ?)
      `,
      args: [chatId, username, content],
    });

    return {
      message_id: insert.lastInsertRowid,
      chat_id: chatId,
      sender_username: username,
      content,
      created_at: new Date().toISOString(),
    };
  }

  async createChat(userA, userB) {
    if (userA === userB) {
      throw { status: 400, message: "No puedes crear un chat contigo mismo" };
    }

    const [username1, username2] = [userA, userB].sort();

    await this.db.execute({
      sql: `INSERT OR IGNORE INTO chats (username1, username2) VALUES (?, ?)`,
      args: [username1, username2],
    });

    const result = await this.db.execute({
      sql: `SELECT chat_id FROM chats WHERE username1 = ? AND username2 = ?`,
      args: [username1, username2],
    });

    if (result.rows.length === 0) {
      throw { status: 500, message: "No se pudo obtener el chat" };
    }

    return result.rows[0].chat_id;
  }

  async getMessages(chatId, username, limit = 20, offset = 0) {
    const check = await this.db.execute({
      sql: `
        SELECT 1
        FROM chats
        WHERE chat_id = ?
          AND (username1 = ? OR username2 = ?)
      `,
      args: [chatId, username, username],
    });

    if (check.rows.length === 0) {
      throw { status: 403, message: "No autorizado" };
    }

    const result = await this.db.execute({
      sql: `
        SELECT message_id, sender_username, content, created_at
        FROM messages
        WHERE chat_id = ?
        ORDER BY created_at ASC
        LIMIT ?
        OFFSET ?
      `,
      args: [chatId, limit, offset],
    });

    return result.rows;
  }

  async getParticipants(chatId) {
    const result = await this.db.execute({
      sql: `SELECT username1, username2 FROM chats WHERE chat_id = ?`,
      args: [chatId],
    });

    if (result.rows.length === 0) {
      throw { status: 404, message: "Chat no encontrado" };
    }

    return [result.rows[0].username1, result.rows[0].username2];
  }

  async getChatsByUsername(username) {
    const result = await this.db.execute({
      sql: `
        SELECT
          c.chat_id,
          CASE
            WHEN c.username1 = ? THEN c.username2
            ELSE c.username1
          END AS other_username,
          u.picture AS other_user_picture,
          m.content AS last_message,
          m.created_at AS last_message_at
        FROM chats c
        LEFT JOIN messages m
          ON m.chat_id = c.chat_id
          AND m.created_at = (
            SELECT MAX(created_at) FROM messages WHERE chat_id = c.chat_id
          )
        JOIN users u
          ON u.username = CASE
            WHEN c.username1 = ? THEN c.username2
            ELSE c.username1
          END
        WHERE c.username1 = ? OR c.username2 = ?
        ORDER BY last_message_at DESC;
      `,
      args: [username, username, username, username],
    });

    return result.rows;
  }

  async getOtherUserInChat(chatId, username) {
    const result = await this.db.execute({
      sql: `
        SELECT u.username AS other_username, u.picture AS other_user_picture
        FROM chats c
        JOIN users u ON u.username = CASE
          WHEN c.username1 = ? THEN c.username2
          ELSE c.username1
        END
        WHERE c.chat_id = ?
      `,
      args: [username, chatId],
    });

    return result.rows[0] || null;
  }
}

module.exports = Chat;
