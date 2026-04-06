/**
 * Request Event Repository - MongoDB Version
 */

const EventRepository = require('./EventRepository');

const initialState = { host: null, guest: null, house: null, accepted: false };

const fold = (evt, state) => {
  switch (evt.type) {
    case 'created': return { host: evt.host, guest: evt.guest, house: evt.house };
    case 'accepted': return { accepted: true };
    case 'rejected': return { accepted: false };
    default: return {};
  }
};

const eventHandlers = {
  created: async (id, evt, repo) => repo._addToReadModel(id, { host: evt.host, guest: evt.guest, house: evt.house, accepted: false }),
  accepted: async (id, _, repo) => repo._updateInReadModel(id, { accepted: true }),
  rejected: async (id, _, repo) => repo._updateInReadModel(id, { accepted: false }),
};

const commands = {
  create: async (cmd, agg) => { if (agg.version > 0) throw new Error('Request already exists'); return { type: 'created', host: cmd.host, guest: cmd.guest, house: cmd.house }; },
  accept: async (_, agg) => { if (agg.version === 0) throw new Error('Request not found'); if (agg.accepted) return; return { type: 'accepted' }; },
  reject: async (_, agg) => { if (agg.version === 0) throw new Error('Request not found'); if (!agg.accepted) return; return { type: 'rejected' }; },
};

let requestEventRepo = null;

function createRequestEventRepo(readModelCollection) {
  if (requestEventRepo) return requestEventRepo;
  requestEventRepo = new EventRepository('request', 'request-events', { initialState, fold, commands, eventHandlers }, readModelCollection);
  requestEventRepo._initEventSourcing();
  return requestEventRepo;
}

module.exports = { createRequestEventRepo };
