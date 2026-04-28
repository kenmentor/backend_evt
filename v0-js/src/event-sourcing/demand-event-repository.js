/**
 * Demand Event Repository - MongoDB Version (Updated)
 * Event naming: demandCreated, demandResponded
 */

const EventRepository = require('./EventRepository');

const initialState = { guest: null, description: '', state: '', price: 0, type: '', category: '', responded: false };

const fold = (evt, state) => {
  switch (evt.type) {
    case 'demandCreated': return { guest: evt.guest, description: evt.description, state: evt.state, price: evt.price, type: evt.type, category: evt.category };
    case 'demandResponded': return { responded: true };
    default: return {};
  }
};

const eventHandlers = {
  demandCreated: async (id, evt, repo) => repo._addToReadModel(id, { guest: evt.guest, description: evt.description, state: evt.state || '', price: evt.price, type: evt.type || '', category: evt.category, responded: false }),
  demandResponded: async (id, _, repo) => repo._updateInReadModel(id, { responded: true }),
};

const commands = {
  create: async (cmd, agg) => { if (agg.version > 0) throw new Error('Demand already exists'); return { type: 'demandCreated', guest: cmd.guest, description: cmd.description, state: cmd.state, price: cmd.price, type: cmd.type, category: cmd.category }; },
  respond: async (_, agg) => { if (agg.version === 0) throw new Error('Demand not found'); if (agg.responded) return; return { type: 'demandResponded' }; },
};

let demandEventRepo = null;

function createDemandEventRepo(readModelCollection) {
  if (demandEventRepo) return demandEventRepo;
  demandEventRepo = new EventRepository('demand', 'demand-events', { initialState, fold, commands, eventHandlers }, readModelCollection);
  demandEventRepo._initEventSourcing();
  return demandEventRepo;
}

module.exports = { createDemandEventRepo };