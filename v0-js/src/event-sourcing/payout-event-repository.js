/**
 * Payout Event Repository - MongoDB Version (Updated)
 * Event naming: payoutCreated, payoutPaid, payoutFailed
 */

const EventRepository = require('./EventRepository');

const initialState = { agentId: null, propertyId: null, propertyTitle: '', hostId: null, bookingId: null, amount: 0, commission: 0, status: 'pending', paidDate: null };

const fold = (evt, state) => {
  switch (evt.type) {
    case 'payoutCreated': return { agentId: evt.agentId, propertyId: evt.propertyId, propertyTitle: evt.propertyTitle, hostId: evt.hostId, bookingId: evt.bookingId, amount: evt.amount, commission: evt.commission };
    case 'payoutPaid': return { status: 'paid', paidDate: new Date() };
    case 'payoutFailed': return { status: 'failed' };
    default: return {};
  }
};

const eventHandlers = {
  payoutCreated: async (id, evt, repo) => repo._addToReadModel(id, { agentId: evt.agentId, propertyId: evt.propertyId, propertyTitle: evt.propertyTitle, hostId: evt.hostId, bookingId: evt.bookingId, amount: evt.amount, commission: evt.commission, status: 'pending', paidDate: null }),
  payoutPaid: async (id, _, repo) => repo._updateInReadModel(id, { status: 'paid', paidDate: new Date() }),
  payoutFailed: async (id, _, repo) => repo._updateInReadModel(id, { status: 'failed' }),
};

const commands = {
  create: async (cmd, agg) => { if (agg.version > 0) throw new Error('Payout already exists'); return { type: 'payoutCreated', agentId: cmd.agentId, propertyId: cmd.propertyId, propertyTitle: cmd.propertyTitle, hostId: cmd.hostId, bookingId: cmd.bookingId, amount: cmd.amount, commission: cmd.commission }; },
  markPaid: async (_, agg) => { if (agg.version === 0) throw new Error('Payout not found'); if (agg.status !== 'pending') throw new Error('Payout already processed'); return { type: 'payoutPaid' }; },
  markFailed: async (_, agg) => { if (agg.version === 0) throw new Error('Payout not found'); if (agg.status !== 'pending') throw new Error('Payout already processed'); return { type: 'payoutFailed' }; },
};

let payoutEventRepo = null;

function createPayoutEventRepo(readModelCollection) {
  if (payoutEventRepo) return payoutEventRepo;
  payoutEventRepo = new EventRepository('payout', 'payout-events', { initialState, fold, commands, eventHandlers }, readModelCollection);
  payoutEventRepo._initEventSourcing();
  return payoutEventRepo;
}

module.exports = { createPayoutEventRepo };