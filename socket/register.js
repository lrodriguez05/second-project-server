const db = require("../db");
const { eventMessage, eventJoin } = require("./events");

function registerEvents(io, socket) {
  eventMessage(socket, io);
  eventJoin(socket);
}

module.exports = registerEvents;
