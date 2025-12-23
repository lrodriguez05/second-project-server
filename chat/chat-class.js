const db = require("../db");

class Chat {
  constructor() {
    this.db = db;
  }

  async getUsers() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT username, picture, description FROM users`,
        (err, rows) => {
          if (err) {
            return reject(err);
          }
          resolve(rows);
        }
      );
    });
  }

  async sendMessage(chatId, username, content) {
    return new Promise((resolve, reject) => {
      if (!content || !content.trim()) {
        return reject({
          status: 400,
          message: "El mensaje no puede estar vacío",
        });
      }

      const checkQuery = `
      SELECT 1
      FROM chats
      WHERE chat_id = ?
        AND (username1 = ? OR username2 = ?)
    `;

      this.db.get(checkQuery, [chatId, username, username], (err, row) => {
        if (err) return reject(err);
        if (!row) {
          return reject({
            status: 403,
            message: "No autorizado para este chat",
          });
        }

        const insertQuery = `
          INSERT INTO messages (chat_id, sender_username, content)
          VALUES (?, ?, ?)
        `;

        this.db.run(insertQuery, [chatId, username, content], function (err) {
          if (err) return reject(err);

          resolve({
            message_id: this.lastID,
            chat_id: chatId,
            sender_username: username,
            content,
            created_at: new Date().toISOString(),
          });
        });
      });
    });
  }

  async createChat(userA, userB) {
    return new Promise((resolve, reject) => {
      if (userA === userB) {
        return reject({
          status: 400,
          message: "No puedes crear un chat contigo mismo",
        });
      }

      const [username1, username2] = [userA, userB].sort();

      const insertQuery = `
      INSERT OR IGNORE INTO chats (username1, username2)
      VALUES (?, ?)
    `;

      this.db.run(insertQuery, [username1, username2], (err) => {
        if (err) return reject(err);

        const selectQuery = `
        SELECT chat_id
        FROM chats
        WHERE username1 = ? AND username2 = ?
      `;

        this.db.get(selectQuery, [username1, username2], (err, row) => {
          if (err) return reject(err);
          if (!row) {
            return reject({
              status: 500,
              message: "No se pudo obtener el chat",
            });
          }

          resolve(row.chat_id);
        });
      });
    });
  }

  async getMessages(chatId, username, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const checkQuery = `
      SELECT 1
      FROM chats
      WHERE chat_id = ?
        AND (username1 = ? OR username2 = ?)
    `;

      this.db.get(checkQuery, [chatId, username, username], (err, row) => {
        if (err) return reject(err);
        if (!row) {
          return reject({ status: 403, message: "No autorizado" });
        }

        const messagesQuery = `
          SELECT
            message_id,
            sender_username,
            content,
            created_at
          FROM messages
          WHERE chat_id = ?
          ORDER BY created_at ASC
          LIMIT ?
          OFFSET ?
        `;

        this.db.all(messagesQuery, [chatId, limit, offset], (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
    });
  }

  async getParticipants(chatId) {
    return new Promise((resolve, reject) => {
      const query = `
      SELECT username1, username2
      FROM chats
      WHERE chat_id = ?
    `;

      this.db.get(query, [chatId], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject({ status: 404, message: "Chat no encontrado" });

        resolve([row.username1, row.username2]);
      });
    });
  }

  async getChatsByUsername(username) {
    const query = `
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
          SELECT MAX(created_at)
          FROM messages
          WHERE chat_id = c.chat_id
        )

      JOIN users u
        ON u.username = (
          CASE
            WHEN c.username1 = ? THEN c.username2
            ELSE c.username1
          END
        )

      WHERE c.username1 = ? OR c.username2 = ?
      ORDER BY last_message_at DESC;
    `;

    return new Promise((resolve, reject) => {
      this.db.all(
        query,
        [username, username, username, username],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  async getOtherUserInChat(chatId, username) {
    const query = `
    SELECT
      u.username AS other_username,
      u.picture AS other_user_picture
    FROM chats c
    JOIN users u ON u.username = CASE
      WHEN c.username1 = ? THEN c.username2
      ELSE c.username1
    END
    WHERE c.chat_id = ?
  `;

    return new Promise((resolve, reject) => {
      this.db.get(query, [username, chatId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
}

module.exports = Chat;

//   async getChatsByUsername(username) { ... } COMPLETED

//   async createChat(userA, userB) { ... } COMPLETED

//   async getChatById(chatId) { ... }

//   async getMessages(chatId, limit = 20, offset = 0) { ... } COMPLETED

//   async sendMessage(chatId, senderUsername, content) { ... } COMPLETED

//   async getLastMessage(chatId) { ... }

//   async deleteMessage(messageId, username) { ... }

//   async deleteChat(chatId, username) { ... }
