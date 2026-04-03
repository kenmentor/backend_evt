let io = null;

function setSocketIO(socketIO) {
  io = socketIO;
}

function getIO() {
  return io;
}

function emitToUser(userId, event, data) {
  if (io) {
    io.of("/chat").to(`user:${userId}`).emit(event, data);
  }
}

function emitToConversation(conversationId, event, data) {
  if (io) {
    io.of("/chat").to(`conversation:${conversationId}`).emit(event, data);
  }
}

module.exports = {
  setSocketIO,
  getIO,
  emitToUser,
  emitToConversation,
};