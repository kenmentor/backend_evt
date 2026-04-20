/**
 * Request Event Repository - MongoDB Version (Updated)
 * Event naming: requestCreated, requestAccepted, etc.
 */

const EventRepository = require('./EventRepository');

const initialState = { host: null, guest: null, house: null, accepted: false };

const fold = (evt, state) => {
  switch (evt.type) {
    case 'requestCreated': return { host: evt.host, guest: evt.guest, house: evt.house };
    case 'requestAccepted': return { accepted: true };
    case 'requestRejected': return { accepted: false };
    default: return {};
  }
};

const eventHandlers = {
  requestCreated: async (id, evt, repo) => repo._addToReadModel(id, { host: evt.host, guest: evt.guest, house: evt.house, accepted: false }),
  requestAccepted: async (id, _, repo) => repo._updateInReadModel(id, { accepted: true }),
  requestRejected: async (id, _, repo) => repo._updateInReadModel(id, { accepted: false }),
};

const commands = {
  create: async (cmd, agg) => { if (agg.version > 0) throw new Error('Request already exists'); return { type: 'requestCreated', host: cmd.host, guest: cmd.guest, house: cmd.house }; },
  accept: async (_, agg) => { if (agg.version === 0) throw new Error('Request not found'); if (agg.accepted) return; return { type: 'requestAccepted' }; },
  reject: async (_, agg) => { if (agg.version === 0) throw new Error('Request not found'); if (!agg.accepted) return; return { type: 'requestRejected' }; },
};

let requestEventRepo = null;

function createRequestEventRepo(readModelCollection) {
  if (requestEventRepo) return requestEventRepo;
  requestEventRepo = new EventRepository('request', 'request-events', { initialState, fold, commands, eventHandlers }, readModelCollection);
  requestEventRepo._initEventSourcing();
  return requestEventRepo;
}

module.exports = { createRequestEventRepo };