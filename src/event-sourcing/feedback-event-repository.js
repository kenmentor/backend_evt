/**
 * Feedback Event Repository - MongoDB Version
 */

const EventRepository = require('./EventRepository');

const initialState = { userId: null, message: '' };

const fold = (evt, state) => {
  switch (evt.type) {
    case 'submitted': return { userId: evt.userId, message: evt.message };
    default: return {};
  }
};

const eventHandlers = {
  submitted: async (id, evt, repo) => repo._addToReadModel(id, { userId: evt.userId, message: evt.message }),
};

const commands = {
  submit: async (cmd, agg) => { if (agg.version > 0) throw new Error('Feedback already submitted'); return { type: 'submitted', userId: cmd.userId, message: cmd.message }; },
};

let feedbackEventRepo = null;

function createFeedbackEventRepo(readModelCollection) {
  if (feedbackEventRepo) return feedbackEventRepo;
  feedbackEventRepo = new EventRepository('feedback', 'feedback-events', { initialState, fold, commands, eventHandlers }, readModelCollection);
  feedbackEventRepo._initEventSourcing();
  return feedbackEventRepo;
}

module.exports = { createFeedbackEventRepo };
