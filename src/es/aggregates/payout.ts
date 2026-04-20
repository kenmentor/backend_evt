import { createAggregate } from 'evtstore';
import type { PayoutEvt, PayoutAgg } from '../types/payout';

export const payoutAgg = createAggregate<PayoutEvt, PayoutAgg, 'payouts'>({
  stream: 'payouts',
  create: (): PayoutAgg => ({
    host: '',
    agentId: '',
    amount: 0,
    bankName: '',
    accountNumber: '',
    accountName: '',
    status: 'pending',
    transactionRef: '',
  }),
  fold: (evt, prev): PayoutAgg => {
    switch (evt.type) {
      case 'payoutCreated':
        return {
          ...prev,
          host: evt.host,
          agentId: evt.agentId,
          amount: evt.amount,
          bankName: evt.bankName || '',
          accountNumber: evt.accountNumber || '',
          accountName: evt.accountName || '',
          status: 'pending',
          transactionRef: '',
        };

      case 'payoutApproved':
        return {
          ...prev,
          status: 'approved',
        };

      case 'payoutRejected':
        return {
          ...prev,
          status: 'rejected',
        };

      case 'payoutProcessed':
        return {
          ...prev,
          status: 'processed',
          transactionRef: evt.transactionRef || '',
        };

      default:
        return prev;
    }
  },
});