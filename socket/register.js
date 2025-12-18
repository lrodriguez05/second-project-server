const db = require("../db");
const eventMessage = require("./events");

function registerEvents(io, socket) {
  eventMessage(socket, io);
}

module.exports = registerEvents;
