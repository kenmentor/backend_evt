import { createAggregate } from 'evtstore';
import type { ConversationEvt, ConversationAgg, MessageEvt, MessageAgg } from '../types/chat';

export const conversationAgg = createAggregate<ConversationEvt, ConversationAgg, 'conversations'>({
  stream: 'conversations',
  create: (): ConversationAgg => ({
    participants: [],
    participantNames: {},
    participantAvatars: {},
    propertyContext: '',
    lastMessage: null,
    unreadCount: {},
  }),
  fold: (evt, prev): ConversationAgg => {
    switch (evt.type) {
      case 'conversationCreated':
        const unreadCount: Record<string, number> = {};
        evt.participants.forEach(p => { unreadCount[p] = 0; });
        return {
          ...prev,
          participants: evt.participants,
          participantNames: evt.participantNames,
          participantAvatars: evt.participantAvatars,
          propertyContext: evt.propertyContext || '',
          lastMessage: null,
          unreadCount,
        };

      case 'conversationParticipantAdded':
        return {
          ...prev,
          participants: [...prev.participants, evt.participantId],
          participantNames: { ...prev.participantNames, [evt.participantId]: evt.participantName },
          unreadCount: { ...prev.unreadCount, [evt.participantId]: 0 },
        };

      case 'conversationMessageSent':
        return {
          ...prev,
          lastMessage: { content: evt.content, senderId: evt.senderId, timestamp: new Date() },
        };

      case 'conversationMessageRead':
        return {
          ...prev,
          unreadCount: { ...prev.unreadCount, [evt.userId]: 0 },
        };

      case 'conversationPropertyContextUpdated':
        return {
          ...prev,
          propertyContext: evt.propertyContext,
        };

      default:
        return prev;
    }
  },
});

export const messageAgg = createAggregate<MessageEvt, MessageAgg, 'messages'>({
  stream: 'messages',
  create: (): MessageAgg => ({
    conversationId: '',
    senderId: '',
    receiverId: '',
    content: '',
    read: false,
    deleted: false,
  }),
  fold: (evt, prev): MessageAgg => {
    switch (evt.type) {
      case 'messageSent':
        return {
          ...prev,
          conversationId: evt.conversationId,
          senderId: evt.senderId,
          receiverId: evt.receiverId,
          content: evt.content,
          read: false,
          deleted: false,
        };

      case 'messageRead':
        return {
          ...prev,
          read: true,
        };

      case 'messageDeleted':
        return {
          ...prev,
          content: '[deleted]',
          deleted: true,
        };

      default:
        return prev;
    }
  },
});