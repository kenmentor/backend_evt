/**
 * Payout Event Repository - MongoDB Version
 */

const EventRepository = require('./EventRepository');

const initialState = { agentId: null, propertyId: null, propertyTitle: '', hostId: null, bookingId: null, amount: 0, commission: 0, status: 'pending', paidDate: null };

const fold = (evt, state) => {
  switch (evt.type) {
    case 'created': return { agentId: evt.agentId, propertyId: evt.propertyId, propertyTitle: evt.propertyTitle, hostId: evt.hostId, bookingId: evt.bookingId, amount: evt.amount, commission: evt.commission };
    case 'paid': return { status: 'paid', paidDate: new Date() };
    case 'failed': return { status: 'failed' };
    default: return {};
  }
};

const eventHandlers = {
  created: async (id, evt, repo) => repo._addToReadModel(id, { agentId: evt.agentId, propertyId: evt.propertyId, propertyTitle: evt.propertyTitle, hostId: evt.hostId, bookingId: evt.bookingId, amount: evt.amount, commission: evt.commission, status: 'pending', paidDate: null }),
  paid: async (id, _, repo) => repo._updateInReadModel(id, { status: 'paid', paidDate: new Date() }),
  failed: async (id, _, repo) => repo._updateInReadModel(id, { status: 'failed' }),
};

const commands = {
  create: async (cmd, agg) => { if (agg.version > 0) throw new Error('Payout already exists'); return { type: 'created', agentId: cmd.agentId, propertyId: cmd.propertyId, propertyTitle: cmd.propertyTitle, hostId: cmd.hostId, bookingId: cmd.bookingId, amount: cmd.amount, commission: cmd.commission }; },
  markPaid: async (_, agg) => { if (agg.version === 0) throw new Error('Payout not found'); if (agg.status !== 'pending') throw new Error('Payout already processed'); return { type: 'paid' }; },
  markFailed: async (_, agg) => { if (agg.version === 0) throw new Error('Payout not found'); if (agg.status !== 'pending') throw new Error('Payout already processed'); return { type: 'failed' }; },
};

let payoutEventRepo = null;

function createPayoutEventRepo(readModelCollection) {
  if (payoutEventRepo) return payoutEventRepo;
  payoutEventRepo = new EventRepository('payout', 'payout-events', { initialState, fold, commands, eventHandlers }, readModelCollection);
  payoutEventRepo._initEventSourcing();
  return payoutEventRepo;
}

module.exports = { createPayoutEventRepo };
