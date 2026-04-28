import { Request, Response } from "express";
import { sendMessage, getConversations, getMessages, markAsRead } from "../service/chat-service";
import { response } from "../utility";
import { emitToUser, emitToConversation } from "../socket/emitHelper";
const { goodResponse, badResponse } = response;

async function send_message(req: Request, res: Response) {
  try {
    const { senderId, receiverId, content, propertyId, propertyTitle } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json(badResponse("senderId, receiverId, and content are required", 400));
    }

    const result = await sendMessage(
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

    emitToUser(receiverId.toString(), "new_message", { message });
    emitToConversation(result.conversationId.toString(), "new_message", { message });

    return res.json(goodResponse({
      id: result.message._id,
      conversationId: result.conversationId,
      content: result.message.content,
      senderId: result.message.senderId,
      receiverId: result.message.receiverId,
      timestamp: result.message.createdAt,
    }));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function get_conversations(req: Request, res: Response) {
  try {
    const userId = req.params.userId as string;

    if (!userId) {
      return res.status(400).json(badResponse("userId is required", 400));
    }

    const conversations = await getConversations(userId);
    return res.json(goodResponse(conversations));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function get_messages(req: Request, res: Response) {
  try {
    const userId1 = req.params.userId1 as string;
    const userId2 = req.params.userId2 as string;

    if (!userId1 || !userId2) {
      return res.status(400).json(badResponse("userId1 and userId2 are required", 400));
    }

    const result = await getMessages(userId1, userId2);
    return res.json(goodResponse(result));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function mark_read(req: Request, res: Response) {
  try {
    const { conversationId, userId } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json(badResponse("conversationId and userId are required", 400));
    }

    const result = await markAsRead(conversationId, userId);

    if (result && result.participants) {
      const otherUserId = result.participants.find(
        (p: any) => p.toString() !== userId.toString()
      );
      if (otherUserId) {
        emitToUser(otherUserId.toString(), "messages_read", {
          conversationId,
          readBy: userId,
        });
      }
    }

    return res.json(goodResponse(null, "Marked as read successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

export {
  send_message,
  get_conversations,
  get_messages,
  mark_read,
};
