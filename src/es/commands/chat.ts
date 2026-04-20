import { createCommands } from 'evtstore';
import type {
  ConversationEvt,
  ConversationAgg,
  ConversationCmd,
  MessageEvt,
  MessageAgg,
  MessageCmd,
} from '../types/chat';
import { domain } from '../domain';

export const conversationCmd = createCommands<ConversationEvt, ConversationAgg, ConversationCmd>(
  domain.conversations,
  {
    async create(cmd, agg) {
      if (agg.version > 0) throw new Error('Conversation already exists');
      return {
        type: 'conversationCreated',
        participants: cmd.participants,
        participantNames: cmd.participantNames,
        participantAvatars: cmd.participantAvatars,
        propertyContext: cmd.propertyContext,
        performedBy: cmd.performedBy,
      };
    },

    async addParticipant(cmd, agg) {
      if (agg.version === 0) throw new Error('Conversation not found');
      if (agg.participants.includes(cmd.participantId)) {
        throw new Error('Participant already in conversation');
      }
      return {
        type: 'conversationParticipantAdded',
        participantId: cmd.participantId,
        participantName: cmd.participantName,
        performedBy: cmd.performedBy,
      };
    },

    async sendMessage(cmd, agg) {
      if (agg.version === 0) throw new Error('Conversation not found');
      if (!agg.participants.includes(cmd.senderId)) {
        throw new Error('Sender not in conversation');
      }
      return {
        type: 'conversationMessageSent',
        content: cmd.content,
        senderId: cmd.senderId,
        performedBy: cmd.performedBy,
      };
    },

    async markAsRead(cmd, agg) {
      if (agg.version === 0) throw new Error('Conversation not found');
      return {
        type: 'conversationMessageRead',
        userId: cmd.userId,
        performedBy: cmd.performedBy,
      };
    },

    async updatePropertyContext(cmd, agg) {
      if (agg.version === 0) throw new Error('Conversation not found');
      return {
        type: 'conversationPropertyContextUpdated',
        propertyContext: cmd.propertyContext,
        performedBy: cmd.performedBy,
      };
    },
  }
);

export const messageCmd = createCommands<MessageEvt, MessageAgg, MessageCmd>(domain.messages, {
  async send(cmd, agg) {
    if (agg.version > 0) throw new Error('Message already sent');
    return {
      type: 'messageSent',
      conversationId: cmd.conversationId,
      senderId: cmd.senderId,
      receiverId: cmd.receiverId,
      content: cmd.content,
      performedBy: cmd.performedBy,
    };
  },

  async markAsRead(cmd, agg) {
    if (agg.version === 0) throw new Error('Message not found');
    if (agg.read) return;
    return {
      type: 'messageRead',
      performedBy: cmd.performedBy,
    };
  },

  async delete(cmd, agg) {
    if (agg.version === 0) throw new Error('Message not found');
    if (agg.deleted) throw new Error('Message already deleted');
    return {
      type: 'messageDeleted',
      performedBy: cmd.performedBy,
    };
  },
});