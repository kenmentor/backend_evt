const jwt = require("jsonwebtoken");
const chatService = require("../service/chat-service");
const { userDB } = require("../modules");

const JWT_SECRET = process.env.JWT_API_KEY || "default-secret-key";

// In-memory presence tracking
const onlineUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

// Helper to get user from token
function getUserFromToken(token) {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Authentication middleware for Socket.io
function authMiddleware(socket, next) {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  
  if (!token) {
    return next(new Error("Authentication required"));
  }
  
  const user = getUserFromToken(token);
  if (!user) {
    return next(new Error("Invalid token"));
  }
  
  socket.userId = user._id || user.id || user.email;
  socket.user = user;
  next();
}

// Handle user online status
async function handleUserOnline(userId) {
  // Get all users who have conversations with this user
  try {
    const { Conversation } = require("../modules/chat");
    const conversations = await Conversation.find({ participants: userId });
    
    const otherUserIds = new Set();
    conversations.forEach(conv => {
      conv.participants.forEach(p => {
        if (p.toString() !== userId.toString()) {
          otherUserIds.add(p.toString());
        }
      });
    });
    
    // Emit to other users who are online
    otherUserIds.forEach(otherUserId => {
      const otherSocketId = onlineUsers.get(otherUserId);
      if (otherSocketId) {
        // This will be handled by the socket instance
      }
    });
  } catch (error) {
    console.error("Error handling user online:", error);
  }
}

function initializeChatSocket(chatNamespace) {
  chatNamespace.use(authMiddleware);

  chatNamespace.on("connection", async (socket) => {
    console.log(`User connected: ${socket.userId}, Socket: ${socket.id}`);
    
    // Track online user
    onlineUsers.set(socket.userId.toString(), socket.id);
    userSockets.set(socket.id, socket.userId.toString());
    
    // Notify others that this user is online
    socket.broadcast.emit("user_online", { userId: socket.userId });
    
    // Join user's personal room for direct messages
    socket.join(`user:${socket.userId}`);
    
    // Handle joining conversation room
    socket.on("join_conversation", async (data, callback) => {
      try {
        const { conversationId } = data;
        if (!conversationId) {
          return callback({ success: false, message: "conversationId required" });
        }
        
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        
        callback({ success: true });
      } catch (error) {
        console.error("Error joining conversation:", error);
        callback({ success: false, message: error.message });
      }
    });
    
    // Handle leaving conversation room
    socket.on("leave_conversation", async (data, callback) => {
      try {
        const { conversationId } = data;
        if (!conversationId) {
          return callback({ success: false, message: "conversationId required" });
        }
        
        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
        
        callback({ success: true });
      } catch (error) {
        console.error("Error leaving conversation:", error);
        callback({ success: false, message: error.message });
      }
    });
    
    // Handle sending message
    socket.on("send_message", async (data, callback) => {
      try {
        const { receiverId, content, conversationId, propertyId, propertyTitle } = data;
        
        if (!receiverId || !content) {
          return callback({ success: false, message: "receiverId and content required" });
        }
        
        // Save message to database
        const result = await chatService.sendMessage(
          socket.userId,
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
        
        // Emit to sender (confirm)
        socket.emit("message_sent", { success: true, message });
        
        // Emit to receiver via their personal room
        chatNamespace.to(`user:${receiverId}`).emit("new_message", { message });
        
        // Also emit to conversation room if conversationId provided
        if (conversationId) {
          chatNamespace.to(`conversation:${conversationId}`).emit("new_message", { message });
        }
        
        console.log(`Message sent from ${socket.userId} to ${receiverId}`);
        
        callback({ success: true, message });
      } catch (error) {
        console.error("Error sending message:", error);
        callback({ success: false, message: error.message });
      }
    });
    
    // Handle typing start
    socket.on("typing_start", (data) => {
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
    
    // Handle typing stop
    socket.on("typing_stop", (data) => {
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
    
    // Handle mark as read
    socket.on("mark_read", async (data, callback) => {
      try {
        const { conversationId, messageId } = data;
        
        if (!conversationId) {
          return callback({ success: false, message: "conversationId required" });
        }
        
        // Mark as read in database
        await chatService.markAsRead(conversationId, socket.userId);
        
        // Get conversation to find the other participant
        const { Conversation } = require("../modules/chat");
        const conversation = await Conversation.findById(conversationId);
        
        if (conversation) {
          const otherUserId = conversation.participants.find(
            p => p.toString() !== socket.userId.toString()
          );
          
          if (otherUserId) {
            // Notify the other user
            chatNamespace.to(`user:${otherUserId.toString()}`).emit("messages_read", {
              conversationId,
              readBy: socket.userId,
            });
          }
        }
        
        callback({ success: true });
      } catch (error) {
        console.error("Error marking as read:", error);
        callback({ success: false, message: error.message });
      }
    });
    
    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}, Socket: ${socket.id}`);
      
      // Remove from online users
      onlineUsers.delete(socket.userId.toString());
      userSockets.delete(socket.id);
      
      // Notify others that this user is offline
      socket.broadcast.emit("user_offline", { userId: socket.userId });
    });
  });
}

module.exports = { initializeChatSocket };