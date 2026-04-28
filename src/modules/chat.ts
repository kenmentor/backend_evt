import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  participantNames: Map<string, string>;
  participantAvatars: Map<string, string>;
  propertyContext: {
    propertyId?: mongoose.Types.ObjectId;
    propertyTitle?: string;
  };
  lastMessage: {
    content?: string;
    senderId?: mongoose.Types.ObjectId;
    timestamp?: Date;
  };
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    participantNames: {
      type: Map,
      of: String,
    },
    participantAvatars: {
      type: Map,
      of: String,
    },
    propertyContext: {
      propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
      propertyTitle: String,
    },
    lastMessage: {
      content: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: Date,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ "unreadCount": 1 });

const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
const Message = mongoose.model<IMessage>("Message", messageSchema);

export { Conversation, Message };
