import { createAggregate } from 'evtstore';
import type { PaymentEvt, PaymentAgg } from '../types/payment';

export const paymentAgg = createAggregate<PaymentEvt, PaymentAgg, 'payments'>({
  stream: 'payments',
  create: (): PaymentAgg => ({
    host: '',
    guest: '',
    house: '',
    note: '',
    amount: 0,
    method: '',
    refund: 0,
    status: 'pending',
    paymentRef: '',
  }),
  fold: (evt, prev): PaymentAgg => {
    switch (evt.type) {
      case 'paymentInitiated':
        return {
          ...prev,
          host: evt.host,
          guest: evt.guest,
          house: evt.house,
          note: evt.note || '',
          amount: evt.amount,
          method: evt.method || '',
          refund: 0,
          status: 'pending',
          paymentRef: evt.paymentRef,
        };

      case 'paymentCompleted':
        return {
          ...prev,
          status: 'completed',
        };

      case 'paymentFailed':
        return {
          ...prev,
          status: 'failed',
        };

      case 'paymentRefunded':
        return {
          ...prev,
          status: 'refunded',
          refund: evt.refundAmount,
        };

      case 'paymentRefundRequested':
        return {
          ...prev,
          status: 'refund_requested',
        };

      default:
        return prev;
    }
  },
});