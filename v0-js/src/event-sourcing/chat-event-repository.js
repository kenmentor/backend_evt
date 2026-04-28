/**
 * Chat Event Repository - MongoDB Version (Updated)
 * Handles Conversation and Message aggregates
 * 
 * Event naming: conversationCreated, conversationParticipantAdded, etc. (aggregate prefix + past tense)
 */

const EventRepository = require('./EventRepository');

// ==================== CONVERSATION ====================

const conversationInitialState = {
  participants: [], participantNames: {}, participantAvatars: {}, propertyContext: null, lastMessage: null, unreadCount: {},
};

const conversationFold = (evt, state) => {
  switch (evt.type) {
    case 'conversationCreated':
      return { participants: evt.participants, participantNames: evt.participantNames, participantAvatars: evt.participantAvatars, propertyContext: evt.propertyContext };
    case 'conversationParticipantAdded':
      return { participants: [...state.participants, evt.participantId], participantNames: { ...state.participantNames, [evt.participantId]: evt.participantName } };
    case 'conversationMessageSent':
      return { lastMessage: { content: evt.content, senderId: evt.senderId, timestamp: new Date() } };
    case 'conversationMessageRead':
      return { unreadCount: { ...state.unreadCount, [evt.userId]: 0 } };
    case 'conversationPropertyContextUpdated':
      return { propertyContext: evt.propertyContext };
    default:
      return {};
  }
};

const conversationEventHandlers = {
  conversationCreated: async (id, evt, repo) => {
    const unreadCount = {};
    evt.participants.forEach(p => unreadCount[p] = 0);
    await repo._addToReadModel(id, {
      participants: evt.participants, participantNames: evt.participantNames,
      participantAvatars: evt.participantAvatars, propertyContext: evt.propertyContext,
      lastMessage: null, unreadCount,
    });
  },
  conversationParticipantAdded: async (id, evt, repo) => {
    const existing = await repo.findById(id);
    if (existing) {
      await repo._updateInReadModel(id, {
        participants: [...existing.participants, evt.participantId],
        participantNames: { ...existing.participantNames, [evt.participantId]: evt.participantName },
        unreadCount: { ...existing.unreadCount, [evt.participantId]: 0 },
      });
    }
  },
  conversationMessageSent: async (id, evt, repo) => {
    const existing = await repo.findById(id);
    if (existing) {
      const unreadCount = { ...existing.unreadCount };
      existing.participants.forEach(p => {
        if (p !== evt.senderId) unreadCount[p] = (unreadCount[p] || 0) + 1;
      });
      await repo._updateInReadModel(id, {
        lastMessage: { content: evt.content, senderId: evt.senderId, timestamp: new Date() },
        unreadCount,
      });
    }
  },
  conversationMessageRead: async (id, evt, repo) => {
    const existing = await repo.findById(id);
    if (existing) {
      await repo._updateInReadModel(id, { unreadCount: { ...existing.unreadCount, [evt.userId]: 0 } });
    }
  },
  conversationPropertyContextUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { propertyContext: evt.propertyContext }),
};

const conversationCommands = {
  create: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Conversation already exists');
    return { type: 'conversationCreated', participants: cmd.participants, participantNames: cmd.participantNames, participantAvatars: cmd.participantAvatars, propertyContext: cmd.propertyContext };
  },
  addParticipant: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Conversation not found');
    if (agg.participants.includes(cmd.participantId)) throw new Error('Participant already in conversation');
    return { type: 'conversationParticipantAdded', participantId: cmd.participantId, participantName: cmd.participantName };
  },
  sendMessage: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Conversation not found');
    if (!agg.participants.includes(cmd.senderId)) throw new Error('Sender not in conversation');
    return { type: 'conversationMessageSent', content: cmd.content, senderId: cmd.senderId };
  },
  markAsRead: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Conversation not found');
    return { type: 'conversationMessageRead', userId: cmd.userId };
  },
  updatePropertyContext: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Conversation not found');
    return { type: 'conversationPropertyContextUpdated', propertyContext: cmd.propertyContext };
  },
};

// ==================== MESSAGE ====================

const messageInitialState = {
  conversationId: null, senderId: null, receiverId: null, content: '', read: false, deleted: false,
};

const messageFold = (evt, state) => {
  switch (evt.type) {
    case 'messageSent':
      return { conversationId: evt.conversationId, senderId: evt.senderId, receiverId: evt.receiverId, content: evt.content };
    case 'messageRead':
      return { read: true };
    case 'messageDeleted':
      return { content: '[deleted]', deleted: true };
    default:
      return {};
  }
};

const messageEventHandlers = {
  messageSent: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      conversationId: evt.conversationId, senderId: evt.senderId, receiverId: evt.receiverId, content: evt.content, read: false, deleted: false,
    });
  },
  messageRead: async (id, _, repo) => repo._updateInReadModel(id, { read: true }),
  messageDeleted: async (id, _, repo) => repo._updateInReadModel(id, { content: '[deleted]', deleted: true }),
};

const messageCommands = {
  send: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Message already sent');
    return { type: 'messageSent', conversationId: cmd.conversationId, senderId: cmd.senderId, receiverId: cmd.receiverId, content: cmd.content };
  },
  markAsRead: async (_, agg) => {
    if (agg.version === 0) throw new Error('Message not found');
    if (agg.read) return;
    return { type: 'messageRead' };
  },
  delete: async (_, agg) => {
    if (agg.version === 0) throw new Error('Message not found');
    if (agg.deleted) throw new Error('Message already deleted');
    return { type: 'messageDeleted' };
  },
};

// ==================== FACTORIES ====================

let conversationEventRepo = null;
let messageEventRepo = null;

function createConversationEventRepo(readModelCollection) {
  if (conversationEventRepo) return conversationEventRepo;
  
  conversationEventRepo = new EventRepository('conversation', 'conversation-events', {
    initialState: conversationInitialState,
    fold: conversationFold,
    commands: conversationCommands,
    eventHandlers: conversationEventHandlers,
  }, readModelCollection);

  conversationEventRepo._initEventSourcing();
  return conversationEventRepo;
}

function createMessageEventRepo(readModelCollection) {
  if (messageEventRepo) return messageEventRepo;
  
  messageEventRepo = new EventRepository('message', 'message-events', {
    initialState: messageInitialState,
    fold: messageFold,
    commands: messageCommands,
    eventHandlers: messageEventHandlers,
  }, readModelCollection);

  messageEventRepo._initEventSourcing();
  return messageEventRepo;
}

module.exports = { createConversationEventRepo, createMessageEventRepo };