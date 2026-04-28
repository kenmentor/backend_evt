const mongoose = require("mongoose");
const { Conversation, Message } = require("../modules/chat");
const { connectDB } = require("../utility");

class ChatRepository {
  constructor() {
    this.connectDB = connectDB;
  }

  async findOrCreateConversation(participant1Id, participant2Id, propertyContext = null) {
    await this.connectDB();
    
    let conversation = await Conversation.findOne({
      participants: { $all: [participant1Id, participant2Id] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [participant1Id, participant2Id],
        participantNames: new Map(),
        participantAvatars: new Map(),
        propertyContext: propertyContext || undefined,
        unreadCount: new Map(),
      });
      await conversation.save();
    }

    return conversation;
  }

  async addMessageToConversation(conversationId, messageData) {
    await this.connectDB();
    
    const message = new Message({
      conversationId,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content,
      read: false,
    });
    await message.save();

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const receiverIdStr = messageData.receiverId.toString();
      const currentUnread = conversation.unreadCount.get(receiverIdStr) || 0;
      conversation.unreadCount.set(receiverIdStr, currentUnread + 1);
      conversation.lastMessage = {
        content: messageData.content,
        senderId: messageData.senderId,
        timestamp: new Date(),
      };
      await conversation.save();
    }

    return message;
  }

  async getUserConversations(userId) {
    await this.connectDB();
    
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "userName profileImage")
      .sort({ updatedAt: -1 });

    return conversations;
  }

  async getConversationMessages(conversationId, limit = 50) {
    await this.connectDB();
    
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(limit);

    return messages;
  }

  async getConversationByParticipants(userId1, userId2) {
    await this.connectDB();
    
    const conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] },
    }).populate("participants", "userName profileImage");

    return conversation;
  }

  async markAsRead(conversationId, userId) {
    await this.connectDB();
    
    const userIdStr = userId.toString();
    
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.unreadCount.set(userIdStr, 0);
      await conversation.save();
    }

    await Message.updateMany(
      { conversationId, receiverId: userId, read: false },
      { read: true }
    );

    return conversation;
  }

  async updateParticipantInfo(conversationId, userId, userName, avatar) {
    await this.connectDB();
    
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const userIdStr = userId.toString();
      conversation.participantNames.set(userIdStr, userName);
      if (avatar) {
        conversation.participantAvatars.set(userIdStr, avatar);
      }
      await conversation.save();
    }
    return conversation;
  }
}

module.exports = ChatRepository;