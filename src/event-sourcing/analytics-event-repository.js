/**
 * Analytics Event Repository - MongoDB Version (Updated)
 * Event naming: analyticsRecorded
 */

const EventRepository = require('./EventRepository');

const initialState = { type: '', action: '', userId: null, metadata: {}, sessionId: null, ipAddress: null, userAgent: null, referrer: null, timestamp: null };

const fold = (evt, state) => {
  switch (evt.type) {
    case 'analyticsRecorded': return { type: evt.type, action: evt.action, userId: evt.userId, metadata: evt.metadata, sessionId: evt.sessionId, ipAddress: evt.ipAddress, userAgent: evt.userAgent, referrer: evt.referrer, timestamp: new Date() };
    default: return { type: evt.type, action: evt.action, userId: evt.userId, metadata: evt.metadata };
  }
};

const eventHandlers = {
  analyticsRecorded: async (id, evt, repo) => repo._addToReadModel(id, { type: evt.type, action: evt.action, userId: evt.userId, metadata: evt.metadata || {}, sessionId: evt.sessionId, ipAddress: evt.ipAddress, userAgent: evt.userAgent, referrer: evt.referrer, timestamp: new Date() }),
};

const commands = {
  track: async (cmd, agg) => { if (agg.version > 0) throw new Error('Analytics already recorded'); return { type: 'analyticsRecorded', action: cmd.action, userId: cmd.userId, metadata: cmd.metadata, sessionId: cmd.sessionId, ipAddress: cmd.ipAddress, userAgent: cmd.userAgent, referrer: cmd.referrer }; },
};

let analyticsEventRepo = null;

function createAnalyticsEventRepo(readModelCollection) {
  if (analyticsEventRepo) return analyticsEventRepo;
  analyticsEventRepo = new EventRepository('analytics', 'analytics-events', { initialState, fold, commands, eventHandlers }, readModelCollection);
  analyticsEventRepo._initEventSourcing();
  return analyticsEventRepo;
}

module.exports = { createAnalyticsEventRepo };