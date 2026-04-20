import { createCommands } from 'evtstore';
import type { BookingEvt, BookingAgg, BookingCmd } from '../types/booking';
import { domain } from '../domain';

export const bookingCmd = createCommands<BookingEvt, BookingAgg, BookingCmd>(domain.bookings, {
  async create(cmd, agg) {
    if (agg.version > 0) throw new Error('Booking already exists');
    return {
      type: 'bookingCreated',
      host: cmd.host,
      guest: cmd.guest,
      house: cmd.house,
      amount: cmd.amount,
      paymentId: cmd.paymentId,
      checkIn: cmd.checkIn,
      checkOut: cmd.checkOut,
      platformFee: cmd.platformFee,
      performedBy: cmd.performedBy,
    };
  },

  async confirm(cmd, agg) {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'pending') throw new Error('Booking cannot be confirmed');
    return {
      type: 'bookingConfirmed',
      performedBy: cmd.performedBy,
    };
  },

  async cancel(cmd, agg) {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status === 'completed' || agg.status === 'cancelled') {
      throw new Error('Booking cannot be cancelled');
    }
    return {
      type: 'bookingCancelled',
      performedBy: cmd.performedBy,
    };
  },

  async complete(cmd, agg) {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'confirmed') throw new Error('Booking must be confirmed first');
    return {
      type: 'bookingCompleted',
      performedBy: cmd.performedBy,
    };
  },

  async expire(cmd, agg) {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'pending') return;
    return {
      type: 'bookingExpired',
      performedBy: cmd.performedBy,
    };
  },

  async updatePayment(cmd, agg) {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.paymentId === cmd.paymentId) return;
    return {
      type: 'bookingPaymentUpdated',
      paymentId: cmd.paymentId,
      performedBy: cmd.performedBy,
    };
  },

  async changeDates(cmd, agg) {
    if (agg.version === 0) throw new Error('Booking not found');
    if (agg.status !== 'pending') throw new Error('Cannot change dates for confirmed booking');
    return {
      type: 'bookingDatesChanged',
      checkIn: cmd.checkIn,
      checkOut: cmd.checkOut,
      performedBy: cmd.performedBy,
    };
  },
});