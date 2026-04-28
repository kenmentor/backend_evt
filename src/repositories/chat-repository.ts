import type mongoose from "mongoose";
import { Conversation, type IConversation, Message, type IMessage } from "../modules/chat";
import { connectDB } from "../utility";

class ChatRepository {
  private connectDB: typeof import("../utility").connectDB;

  constructor() {
    this.connectDB = connectDB;
  }

  async findOrCreateConversation(
    participant1Id: mongoose.Types.ObjectId | string,
    participant2Id: mongoose.Types.ObjectId | string,
    propertyContext: IConversation["propertyContext"] | null = null
  ) {
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

  async addMessageToConversation(
    conversationId: string,
    messageData: Pick<IMessage, 'senderId' | 'receiverId' | 'content'>
  ) {
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
      const receiverIdStr = String(messageData.receiverId);
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

  async getUserConversations(userId: mongoose.Types.ObjectId | string) {
    await this.connectDB();

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "userName profileImage")
      .sort({ updatedAt: -1 });

    return conversations;
  }

  async getConversationMessages(conversationId: string, limit: number = 50) {
    await this.connectDB();

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(limit);

    return messages;
  }

  async getConversationByParticipants(
    userId1: mongoose.Types.ObjectId | string,
    userId2: mongoose.Types.ObjectId | string
  ) {
    await this.connectDB();

    const conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] },
    }).populate("participants", "userName profileImage");

    return conversation;
  }

  async markAsRead(conversationId: string, userId: mongoose.Types.ObjectId | string) {
    await this.connectDB();

    const userIdStr = String(userId);

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

  async updateParticipantInfo(
    conversationId: string,
    userId: mongoose.Types.ObjectId | string,
    userName: string,
    avatar?: string
  ) {
    await this.connectDB();

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const userIdStr = String(userId);
      conversation.participantNames.set(userIdStr, userName);
      if (avatar) {
        conversation.participantAvatars.set(userIdStr, avatar);
      }
      await conversation.save();
    }
    return conversation;
  }
}

export default ChatRepository;
