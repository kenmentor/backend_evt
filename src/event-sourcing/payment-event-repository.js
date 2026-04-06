/**
 * Payment Event Repository - MongoDB Version
 */

const EventRepository = require('./EventRepository');

const initialState = {
  host: null,
  guest: null,
  house: null,
  note: '',
  amount: 0,
  method: '',
  refund: 0,
  status: 'pending',
  paymentStatus: 'pending',
  paymentRef: '',
};

const fold = (evt, state) => {
  switch (evt.type) {
    case 'initiated':
      return { host: evt.host, guest: evt.guest, house: evt.house, note: evt.note, amount: evt.amount, method: evt.method, paymentRef: evt.paymentRef };
    case 'completed':
      return { status: 'completed', paymentStatus: 'completed' };
    case 'failed':
      return { status: 'failed', paymentStatus: 'failed' };
    case 'refunded':
      return { status: 'refunded', paymentStatus: 'refunded', refund: evt.refundAmount };
    case 'refundRequested':
      return { status: 'refund_requested' };
    default:
      return {};
  }
};

const eventHandlers = {
  initiated: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      host: evt.host, guest: evt.guest, house: evt.house, note: evt.note || '',
      amount: evt.amount, method: evt.method || '', refund: 0, status: 'pending', paymentStatus: 'pending', paymentRef: evt.paymentRef,
    });
  },
  completed: async (id, _, repo) => repo._updateInReadModel(id, { status: 'completed', paymentStatus: 'completed' }),
  failed: async (id, _, repo) => repo._updateInReadModel(id, { status: 'failed', paymentStatus: 'failed' }),
  refunded: async (id, evt, repo) => repo._updateInReadModel(id, { status: 'refunded', paymentStatus: 'refunded', refund: evt.refundAmount }),
  refundRequested: async (id, _, repo) => repo._updateInReadModel(id, { status: 'refund_requested' }),
};

const commands = {
  initiate: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Payment already initiated');
    return { type: 'initiated', host: cmd.host, guest: cmd.guest, house: cmd.house, note: cmd.note, amount: cmd.amount, method: cmd.method, paymentRef: cmd.paymentRef };
  },
  complete: async (_, agg) => {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'pending') throw new Error('Payment already processed');
    return { type: 'completed' };
  },
  fail: async (_, agg) => {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'pending') throw new Error('Payment already processed');
    return { type: 'failed' };
  },
  requestRefund: async (_, agg) => {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'completed') throw new Error('Can only refund completed payments');
    return { type: 'refundRequested' };
  },
  refund: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'refund_requested') throw new Error('Refund not requested');
    return { type: 'refunded', refundAmount: cmd.refundAmount };
  },
};

let paymentEventRepo = null;

function createPaymentEventRepo(readModelCollection) {
  if (paymentEventRepo) return paymentEventRepo;
  
  paymentEventRepo = new EventRepository('payment', 'payment-events', {
    initialState,
    fold,
    commands,
    eventHandlers,
  }, readModelCollection);

  paymentEventRepo._initEventSourcing();
  return paymentEventRepo;
}

module.exports = { createPaymentEventRepo };
