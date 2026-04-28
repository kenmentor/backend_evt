import ChatRepository from "../repositories/chat-repository";
import { userDB } from "../modules";

const chatRepo = new ChatRepository();

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  propertyId: string | null = null,
  propertyTitle: string | null = null
) {
  try {
    let propertyContext: any = null;
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

    const message = await chatRepo.addMessageToConversation(conversation._id as string, {
      senderId: senderId as any,
      receiverId: receiverId as any,
      content,
    });

    const sender = await userDB.findById(senderId).select("userName profileImage");
    const receiver = await userDB.findById(receiverId).select("userName profileImage");

    if (sender) {
      await chatRepo.updateParticipantInfo(
        conversation._id as string,
        senderId,
        sender.userName,
        sender.profileImage
      );
    }
    if (receiver) {
      await chatRepo.updateParticipantInfo(
        conversation._id as string,
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

export async function getConversations(userId: string) {
  try {
    const conversations = await chatRepo.getUserConversations(userId);

    const formatted = conversations.map((conv: any) => {
      const otherParticipant = conv.participants.find(
        (p: any) => p._id.toString() !== userId.toString()
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

export async function getMessages(userId1: string, userId2: string) {
  try {
    const conversation = await chatRepo.getConversationByParticipants(userId1, userId2);

    if (!conversation) {
      return {
        participant: null,
        messages: [],
      };
    }

    const otherParticipant: any = conversation.participants.find(
      (p: any) => p._id.toString() !== userId1.toString()
    );

    const messages = await chatRepo.getConversationMessages(conversation._id as string);

    const formattedMessages = messages.map((msg: any) => ({
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

export async function markAsRead(conversationId: string, userId: string) {
  try {
    const result = await chatRepo.markAsRead(conversationId, userId);
    return result;
  } catch (error) {
    console.error("Error in markAsRead service:", error);
    throw error;
  }
}
