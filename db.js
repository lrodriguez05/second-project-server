const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("lachichat.db");

db.run(`PRAGMA foreign_keys = ON;`);

// db.run(`DROP TABLE users`);
// db.run(`DROP TABLE chats`);
// db.run(`DROP TABLE messages`);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      picture TEXT DEFAULT "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      description TEXT DEFAULT "Me gusta mucho programar");
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chats (
      chat_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username1 TEXT NOT NULL,
      username2 TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(username1, username2),
      FOREIGN KEY(username1) REFERENCES users(username),
      FOREIGN KEY(username2) REFERENCES users(username)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      message_id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      sender_username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(chat_id) REFERENCES chats(chat_id),
      FOREIGN KEY(sender_username) REFERENCES users(username)
    );
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);`);
});

db.insertChat = function (userA, userB, callback) {
  const [username1, username2] = [userA, userB].sort();
  db.run(
    `INSERT OR IGNORE INTO chats(username1, username2) VALUES (?, ?)`,
    [username1, username2],
    callback
  );
};

module.exports = db;
