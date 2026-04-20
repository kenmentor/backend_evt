import { createAggregate } from 'evtstore';
import type { BookingEvt, BookingAgg } from '../types/booking';

export const bookingAgg = createAggregate<BookingEvt, BookingAgg, 'bookings'>({
  stream: 'bookings',
  create: (): BookingAgg => ({
    host: '',
    guest: '',
    house: '',
    amount: 0,
    status: 'pending',
    paymentId: '',
    checkIn: '',
    checkOut: '',
    platformFee: 0,
    expiredDate: new Date(),
  }),
  fold: (evt, prev): BookingAgg => {
    switch (evt.type) {
      case 'bookingCreated':
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + 3);
        return {
          ...prev,
          host: evt.host,
          guest: evt.guest,
          house: evt.house,
          amount: evt.amount,
          paymentId: evt.paymentId || '',
          checkIn: evt.checkIn,
          checkOut: evt.checkOut,
          platformFee: evt.platformFee,
          status: 'pending',
          expiredDate,
        };

      case 'bookingConfirmed':
        return {
          ...prev,
          status: 'confirmed',
        };

      case 'bookingCancelled':
        return {
          ...prev,
          status: 'cancelled',
        };

      case 'bookingCompleted':
        return {
          ...prev,
          status: 'completed',
        };

      case 'bookingExpired':
        return {
          ...prev,
          status: 'expired',
        };

      case 'bookingPaymentUpdated':
        return {
          ...prev,
          paymentId: evt.paymentId,
        };

      case 'bookingDatesChanged':
        return {
          ...prev,
          checkIn: evt.checkIn,
          checkOut: evt.checkOut,
        };

      default:
        return prev;
    }
  },
});