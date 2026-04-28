/**
 * Booking Event Repository - MongoDB Version (Updated)
 * 
 * Event naming: bookingCreated, bookingConfirmed, etc. (aggregate prefix + past tense)
 */

const EventRepository = require('./EventRepository');

const initialState = {
  host: null, guest: null, house: null, amount: 0, status: 'pending',
  paymentId: null, checkIn: null, checkOut: null, platformFee: 0, expiredDate: null,
};

const fold = (evt, state) => {
  switch (evt.type) {
    case 'bookingCreated':
      return { host: evt.host, guest: evt.guest, house: evt.house, amount: evt.amount, paymentId: evt.paymentId, checkIn: evt.checkIn, checkOut: evt.checkOut, platformFee: evt.platformFee };
    case 'bookingConfirmed':
      return { status: 'confirmed' };
    case 'bookingCancelled':
      return { status: 'cancelled' };
    case 'bookingCompleted':
      return { status: 'completed' };
    case 'bookingExpired':
      return { status: 'expired' };
    case 'bookingPaymentUpdated':
      return { paymentId: evt.paymentId };
    case 'bookingDatesChanged':
      return { checkIn: evt.checkIn, checkOut: evt.checkOut };
    default:
      return {};
  }
};

const eventHandlers = {
  bookingCreated: async (id, evt, repo) => {
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 3);
    await repo._addToReadModel(id, {
      host: evt.host, guest: evt.guest, house: evt.house, amount: evt.amount, status: 'pending',
      paymentId: evt.paymentId, checkIn: evt.checkIn, checkOut: evt.checkOut, platformFee: evt.platformFee, expiredDate,
    });
  },
  bookingConfirmed: async (id, _, repo) => repo._updateInReadModel(id, { status: 'confirmed' }),
  bookingCancelled: async (id, _, repo) => repo._updateInReadModel(id, { status: 'cancelled' }),
  bookingCompleted: async (id, _, repo) => repo._updateInReadModel(id, { status: 'completed' }),
  bookingExpired: async (id, _, repo) => repo._updateInReadModel(id, { status: 'expired' }),
  bookingPaymentUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { paymentId: evt.paymentId }),
  bookingDatesChanged: async (id, evt, repo) => repo._updateInReadModel(id, { checkIn: evt.checkIn, checkOut: evt.checkOut }),
};

const commands = {
  create: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Booking already exists');
    return { type: 'bookingCreated', host: cmd.host, guest: cmd.guest, house: cmd.house, amount: cmd.amount, paymentId: cmd.paymentId, checkIn: cmd.checkIn, checkOut: cmd.checkOut, platformFee: cmd.platformFee };
  },
  confirm: async (_, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'pending') throw new Error('Booking cannot be confirmed');
    return { type: 'bookingConfirmed' };
  },
  cancel: async (_, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (['completed', 'cancelled'].includes(agg.status)) throw new Error('Booking cannot be cancelled');
    return { type: 'bookingCancelled' };
  },
  complete: async (_, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'confirmed') throw new Error('Booking must be confirmed first');
    return { type: 'bookingCompleted' };
  },
  expire: async (_, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'pending') return;
    return { type: 'bookingExpired' };
  },
  updatePayment: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.paymentId === cmd.paymentId) return;
    return { type: 'bookingPaymentUpdated', paymentId: cmd.paymentId };
  },
  changeDates: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'pending') throw new Error('Cannot change dates for confirmed booking');
    return { type: 'bookingDatesChanged', checkIn: cmd.checkIn, checkOut: cmd.checkOut };
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