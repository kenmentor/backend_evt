import jwt from "jsonwebtoken";
import { sendMessage, markAsRead } from "../service/chat-service";
import { Conversation } from "../modules/chat";
import type { Socket, Namespace } from "socket.io";

const JWT_SECRET: string = process.env.JWT_API_KEY || "default-secret-key";

interface JwtPayload {
  _id?: string;
  id?: string;
  email?: string;
  [key: string]: unknown;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: JwtPayload;
}

const onlineUsers = new Map<string, string>();
const userSockets = new Map<string, string>();

function getUserFromToken(token: string | undefined): JwtPayload | null {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

function authMiddleware(socket: AuthenticatedSocket, next: (err?: Error) => void): void {
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  const user = getUserFromToken(token as string | undefined);
  if (!user) {
    return next(new Error("Invalid token"));
  }

  socket.userId = user._id || user.id || user.email;
  socket.user = user;
  next();
}

export function initializeChatSocket(chatNamespace: Namespace): void {
  chatNamespace.use(authMiddleware);

  chatNamespace.on("connection", async (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    console.log(`User connected: ${socket.userId}, Socket: ${socket.id}`);

    onlineUsers.set(socket.userId!.toString(), socket.id);
    userSockets.set(socket.id, socket.userId!.toString());

    socket.broadcast.emit("user_online", { userId: socket.userId });

    socket.join(`user:${socket.userId}`);

    socket.on("join_conversation", async (data: { conversationId?: string }, callback?: (res: { success: boolean; message?: string }) => void) => {
      try {
        const { conversationId } = data;
        if (!conversationId) {
          return callback?.({ success: false, message: "conversationId required" });
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);

        callback?.({ success: true });
      } catch (error: any) {
        console.error("Error joining conversation:", error);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("leave_conversation", async (data: { conversationId?: string }, callback?: (res: { success: boolean; message?: string }) => void) => {
      try {
        const { conversationId } = data;
        if (!conversationId) {
          return callback?.({ success: false, message: "conversationId required" });
        }

        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);

        callback?.({ success: true });
      } catch (error: any) {
        console.error("Error leaving conversation:", error);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("send_message", async (data: { receiverId?: string; content?: string; conversationId?: string; propertyId?: string; propertyTitle?: string }, callback?: (res: { success: boolean; message?: any }) => void) => {
      try {
        const { receiverId, content, conversationId, propertyId, propertyTitle } = data;

        if (!receiverId || !content) {
          return callback?.({ success: false, message: "receiverId and content required" });
        }

        const result = await sendMessage(
          socket.userId!,
          receiverId,
          content,
          propertyId,
          propertyTitle
        );

        const message = {
          _id: result.message._id,
          senderId: result.message.senderId,
          receiverId: result.message.receiverId,
          content: result.message.content,
          timestamp: result.message.createdAt,
          read: false,
        };

        socket.emit("message_sent", { success: true, message });

        chatNamespace.to(`user:${receiverId}`).emit("new_message", { message });

        if (conversationId) {
          chatNamespace.to(`conversation:${conversationId}`).emit("new_message", { message });
        }

        console.log(`Message sent from ${socket.userId} to ${receiverId}`);

        callback?.({ success: true, message });
      } catch (error: any) {
        console.error("Error sending message:", error);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("typing_start", (data: { conversationId?: string; receiverId?: string }) => {
      const { conversationId, receiverId } = data;

      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit("typing", {
          userId: socket.userId,
          conversationId,
          isTyping: true,
        });
      }

      if (receiverId) {
        chatNamespace.to(`user:${receiverId}`).emit("typing", {
          userId: socket.userId,
          isTyping: true,
        });
      }
    });

    socket.on("typing_stop", (data: { conversationId?: string; receiverId?: string }) => {
      const { conversationId, receiverId } = data;

      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit("typing", {
          userId: socket.userId,
          conversationId,
          isTyping: false,
        });
      }

      if (receiverId) {
        chatNamespace.to(`user:${receiverId}`).emit("typing", {
          userId: socket.userId,
          isTyping: false,
        });
      }
    });

    socket.on("mark_read", async (data: { conversationId?: string; messageId?: string }, callback?: (res: { success: boolean; message?: string }) => void) => {
      try {
        const { conversationId } = data;

        if (!conversationId) {
          return callback?.({ success: false, message: "conversationId required" });
        }

        await markAsRead(conversationId, socket.userId!);

        const conversation = await Conversation.findById(conversationId);

        if (conversation) {
          const otherUserId = conversation.participants.find(
            (p) => p.toString() !== socket.userId!.toString()
          );

          if (otherUserId) {
            chatNamespace.to(`user:${otherUserId.toString()}`).emit("messages_read", {
              conversationId,
              readBy: socket.userId,
            });
          }
        }

        callback?.({ success: true });
      } catch (error: any) {
        console.error("Error marking as read:", error);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}, Socket: ${socket.id}`);

      onlineUsers.delete(socket.userId!.toString());
      userSockets.delete(socket.id);

      socket.broadcast.emit("user_offline", { userId: socket.userId });
    });
  });
}
