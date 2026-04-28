const ChatRepository = require("../repositories/chat-repository");
const { userDB } = require("../modules");

const chatRepo = new ChatRepository();

async function sendMessage(senderId, receiverId, content, propertyId = null, propertyTitle = null) {
  try {
    let propertyContext = null;
    if (propertyId && propertyTitle) {
      propertyContext = {
        propertyId,
        propertyTitle,
      };
    }

    const conversation = await chatRepo.findOrCreateConversation(
      senderId,
      receiverId,
      propertyContext
    );

    const message = await chatRepo.addMessageToConversation(conversation._id, {
      senderId,
      receiverId,
      content,
    });

    const { userDB: userModel } = require("../modules");
    const mongoose = require("mongoose");
    
    const sender = await userModel.findById(senderId).select("userName profileImage");
    const receiver = await userModel.findById(receiverId).select("userName profileImage");

    if (sender) {
      await chatRepo.updateParticipantInfo(
        conversation._id,
        senderId,
        sender.userName,
        sender.profileImage
      );
    }
    if (receiver) {
      await chatRepo.updateParticipantInfo(
        conversation._id,
        receiverId,
        receiver.userName,
        receiver.profileImage
      );
    }

    return {
      conversationId: conversation._id,
      message,
    };
  } catch (error) {
    console.error("Error in sendMessage service:", error);
    throw error;
  }
}

async function getConversations(userId) {
  try {
    const conversations = await chatRepo.getUserConversations(userId);
    
    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );
      
      return {
        _id: conv._id,
        conversationId: conv._id,
        participantId: otherParticipant?._id,
        participantName: otherParticipant?.userName || "Unknown",
        participantAvatar: otherParticipant?.profileImage || "",
        lastMessage: conv.lastMessage?.content || "",
        lastMessageTime: conv.lastMessage?.timestamp || conv.updatedAt,
        unreadCount: conv.unreadCount.get(userId.toString()) || 0,
        propertyContext: conv.propertyContext || null,
      };
    });

    return formatted;
  } catch (error) {
    console.error("Error in getConversations service:", error);
    throw error;
  }
}

async function getMessages(userId1, userId2) {
  try {
    const conversation = await chatRepo.getConversationByParticipants(userId1, userId2);
    
    if (!conversation) {
      return {
        participant: null,
        messages: [],
      };
    }

    const otherParticipant = conversation.participants.find(
      (p) => p._id.toString() !== userId1.toString()
    );

    const messages = await chatRepo.getConversationMessages(conversation._id);

    const formattedMessages = messages.map((msg) => ({
      _id: msg._id,
      senderId: msg.senderId,
      content: msg.content,
      timestamp: msg.createdAt,
      read: msg.read,
    }));

    return {
      participant: otherParticipant
        ? {
            _id: otherParticipant._id,
            userName: otherParticipant.userName,
            avatar: otherParticipant.profileImage,
          }
        : null,
      messages: formattedMessages,
    };
  } catch (error) {
    console.error("Error in getMessages service:", error);
    throw error;
  }
}

async function markAsRead(conversationId, userId) {
  try {
    const result = await chatRepo.markAsRead(conversationId, userId);
    return result;
  } catch (error) {
    console.error("Error in markAsRead service:", error);
    throw error;
  }
}

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
};