/**
 * Booking Event Repository - MongoDB Version
 */

const EventRepository = require('./EventRepository');

const initialState = {
  host: null,
  guest: null,
  house: null,
  amount: 0,
  status: 'pending',
  paymentId: null,
  checkIn: null,
  checkOut: null,
  platformFee: 0,
  expiredDate: null,
};

const fold = (evt, state) => {
  switch (evt.type) {
    case 'created':
      return { host: evt.host, guest: evt.guest, house: evt.house, amount: evt.amount, paymentId: evt.paymentId, checkIn: evt.checkIn, checkOut: evt.checkOut, platformFee: evt.platformFee };
    case 'confirmed':
      return { status: 'confirmed' };
    case 'cancelled':
      return { status: 'cancelled' };
    case 'completed':
      return { status: 'completed' };
    case 'expired':
      return { status: 'expired' };
    case 'paymentUpdated':
      return { paymentId: evt.paymentId };
    case 'datesChanged':
      return { checkIn: evt.checkIn, checkOut: evt.checkOut };
    default:
      return {};
  }
};

const eventHandlers = {
  created: async (id, evt, repo) => {
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 3);
    await repo._addToReadModel(id, {
      host: evt.host, guest: evt.guest, house: evt.house, amount: evt.amount, status: 'pending',
      paymentId: evt.paymentId, checkIn: evt.checkIn, checkOut: evt.checkOut, platformFee: evt.platformFee, expiredDate,
    });
  },
  confirmed: async (id, _, repo) => repo._updateInReadModel(id, { status: 'confirmed' }),
  cancelled: async (id, _, repo) => repo._updateInReadModel(id, { status: 'cancelled' }),
  completed: async (id, _, repo) => repo._updateInReadModel(id, { status: 'completed' }),
  expired: async (id, _, repo) => repo._updateInReadModel(id, { status: 'expired' }),
  paymentUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { paymentId: evt.paymentId }),
  datesChanged: async (id, evt, repo) => repo._updateInReadModel(id, { checkIn: evt.checkIn, checkOut: evt.checkOut }),
};

const commands = {
  create: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Booking already exists');
    return { type: 'created', host: cmd.host, guest: cmd.guest, house: cmd.house, amount: cmd.amount, paymentId: cmd.paymentId, checkIn: cmd.checkIn, checkOut: cmd.checkOut, platformFee: cmd.platformFee };
  },
  confirm: async (_, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'pending') throw new Error('Booking cannot be confirmed');
    return { type: 'confirmed' };
  },
  cancel: async (_, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (['completed', 'cancelled'].includes(agg.status)) throw new Error('Booking cannot be cancelled');
    return { type: 'cancelled' };
  },
  complete: async (_, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'confirmed') throw new Error('Booking must be confirmed first');
    return { type: 'completed' };
  },
  expire: async (_, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'pending') return;
    return { type: 'expired' };
  },
  updatePayment: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.paymentId === cmd.paymentId) return;
    return { type: 'paymentUpdated', paymentId: cmd.paymentId };
  },
  changeDates: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'pending') throw new Error('Cannot change dates for confirmed booking');
    return { type: 'datesChanged', checkIn: cmd.checkIn, checkOut: cmd.checkOut };
  },
};

let bookingEventRepo = null;

function createBookingEventRepo(readModelCollection) {
  if (bookingEventRepo) return bookingEventRepo;
  
  bookingEventRepo = new EventRepository('booking', 'booking-events', {
    initialState,
    fold,
    commands,
    eventHandlers,
  }, readModelCollection);

  bookingEventRepo._initEventSourcing();
  return bookingEventRepo;
}

module.exports = { createBookingEventRepo };
