import { createAggregate } from 'evtstore';
import type { RequestEvt, RequestAgg } from '../types/request';

export const requestAgg = createAggregate<RequestEvt, RequestAgg, 'requests'>({
  stream: 'requests',
  create: (): RequestAgg => ({
    guest: '',
    host: '',
    house: '',
    checkIn: '',
    checkOut: '',
    guests: 0,
    totalPrice: 0,
    note: '',
    status: 'pending',
  }),
  fold: (evt, prev): RequestAgg => {
    switch (evt.type) {
      case 'requestCreated':
        return {
          ...prev,
          guest: evt.guest,
          host: evt.host,
          house: evt.house,
          checkIn: evt.checkIn,
          checkOut: evt.checkOut,
          guests: evt.guests,
          totalPrice: evt.totalPrice,
          note: evt.note || '',
          status: 'pending',
        };

      case 'requestApproved':
        return {
          ...prev,
          status: 'approved',
        };

      case 'requestRejected':
        return {
          ...prev,
          status: 'rejected',
        };

      case 'requestCancelled':
        return {
          ...prev,
          status: 'cancelled',
        };

      default:
        return prev;
    }
  },
});