/**
 * Payment Event Repository - MongoDB Version (Updated)
 * 
 * Event naming: paymentInitiated, paymentCompleted, etc. (aggregate prefix + past tense)
 */

const EventRepository = require('./EventRepository');

const initialState = {
  host: null, guest: null, house: null, note: '', amount: 0, method: '', refund: 0,
  status: 'pending', paymentStatus: 'pending', paymentRef: '',
};

const fold = (evt, state) => {
  switch (evt.type) {
    case 'paymentInitiated':
      return { host: evt.host, guest: evt.guest, house: evt.house, note: evt.note, amount: evt.amount, method: evt.method, paymentRef: evt.paymentRef };
    case 'paymentCompleted':
      return { status: 'completed', paymentStatus: 'completed' };
    case 'paymentFailed':
      return { status: 'failed', paymentStatus: 'failed' };
    case 'paymentRefunded':
      return { status: 'refunded', paymentStatus: 'refunded', refund: evt.refundAmount };
    case 'paymentRefundRequested':
      return { status: 'refund_requested' };
    default:
      return {};
  }
};

const eventHandlers = {
  paymentInitiated: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      host: evt.host, guest: evt.guest, house: evt.house, note: evt.note || '',
      amount: evt.amount, method: evt.method || '', refund: 0, status: 'pending', paymentStatus: 'pending', paymentRef: evt.paymentRef,
    });
  },
  paymentCompleted: async (id, _, repo) => repo._updateInReadModel(id, { status: 'completed', paymentStatus: 'completed' }),
  paymentFailed: async (id, _, repo) => repo._updateInReadModel(id, { status: 'failed', paymentStatus: 'failed' }),
  paymentRefunded: async (id, evt, repo) => repo._updateInReadModel(id, { status: 'refunded', paymentStatus: 'refunded', refund: evt.refundAmount }),
  paymentRefundRequested: async (id, _, repo) => repo._updateInReadModel(id, { status: 'refund_requested' }),
};

const commands = {
  initiate: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Payment already initiated');
    return { type: 'paymentInitiated', host: cmd.host, guest: cmd.guest, house: cmd.house, note: cmd.note, amount: cmd.amount, method: cmd.method, paymentRef: cmd.paymentRef };
  },
  complete: async (_, agg) => {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'pending') throw new Error('Payment already processed');
    return { type: 'paymentCompleted' };
  },
  fail: async (_, agg) => {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'pending') throw new Error('Payment already processed');
    return { type: 'paymentFailed' };
  },
  requestRefund: async (_, agg) => {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'completed') throw new Error('Can only refund completed payments');
    return { type: 'paymentRefundRequested' };
  },
  refund: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'refund_requested') throw new Error('Refund not requested');
    return { type: 'paymentRefunded', refundAmount: cmd.refundAmount };
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