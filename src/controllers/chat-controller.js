const chatService = require("../service/chat-service");
const { response } = require("../utility");
const { emitToUser, emitToConversation } = require("../socket/emitHelper");

async function send_message(req, res) {
  try {
    const { senderId, receiverId, content, propertyId, propertyTitle } = req.body;

    if (!senderId || !receiverId || !content) {
      const responseData = response.badResponse;
      responseData.message = "senderId, receiverId, and content are required";
      return res.status(400).json(responseData);
    }

    const result = await chatService.sendMessage(
      senderId,
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

    // Emit real-time notification to receiver
    emitToUser(receiverId.toString(), "new_message", { message });

    // Emit to conversation room if applicable
    emitToConversation(result.conversationId.toString(), "new_message", { message });

    const responseData = response.goodResponse;
    responseData.data = {
      id: result.message._id,
      conversationId: result.conversationId,
      content: result.message.content,
      senderId: result.message.senderId,
      receiverId: result.message.receiverId,
      timestamp: result.message.createdAt,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in send_message controller:", error);
    const responseData = response.badResponse;
    responseData.message = error.message || "Failed to send message";
    return res.status(500).json(responseData);
  }
}

async function get_conversations(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      const responseData = response.badResponse;
      responseData.message = "userId is required";
      return res.status(400).json(responseData);
    }

    const conversations = await chatService.getConversations(userId);

    const responseData = response.goodResponse;
    responseData.data = conversations;

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in get_conversations controller:", error);
    const responseData = response.badResponse;
    responseData.message = error.message || "Failed to get conversations";
    return res.status(500).json(responseData);
  }
}

async function get_messages(req, res) {
  try {
    const { userId1, userId2 } = req.params;

    if (!userId1 || !userId2) {
      const responseData = response.badResponse;
      responseData.message = "userId1 and userId2 are required";
      return res.status(400).json(responseData);
    }

    const result = await chatService.getMessages(userId1, userId2);

    const responseData = response.goodResponse;
    responseData.data = result;

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in get_messages controller:", error);
    const responseData = response.badResponse;
    responseData.message = error.message || "Failed to get messages";
    return res.status(500).json(responseData);
  }
}

async function mark_read(req, res) {
  try {
    const { conversationId, userId } = req.body;

    if (!conversationId || !userId) {
      const responseData = response.badResponse;
      responseData.message = "conversationId and userId are required";
      return res.status(400).json(responseData);
    }

    const result = await chatService.markAsRead(conversationId, userId);

    // Emit read receipt to the other participant
    if (result && result.participants) {
      const otherUserId = result.participants.find(
        p => p.toString() !== userId.toString()
      );
      if (otherUserId) {
        emitToUser(otherUserId.toString(), "messages_read", {
          conversationId,
          readBy: userId,
        });
      }
    }

    const responseData = response.goodResponse;
    responseData.message = "Marked as read successfully";

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in mark_read controller:", error);
    const responseData = response.badResponse;
    responseData.message = error.message || "Failed to mark as read";
    return res.status(500).json(responseData);
  }
}

module.exports = {
  send_message,
  get_conversations,
  get_messages,
  mark_read,
};