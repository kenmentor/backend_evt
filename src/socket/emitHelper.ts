import type { Server } from "socket.io";

let io: Server | null = null;

export function setSocketIO(socketIO: Server): void {
  io = socketIO;
}

export function getIO(): Server | null {
  return io;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  if (io) {
    io.of("/chat").to(`user:${userId}`).emit(event, data);
  }
}

export function emitToConversation(conversationId: string, event: string, data: unknown): void {
  if (io) {
    io.of("/chat").to(`conversation:${conversationId}`).emit(event, data);
  }
}
