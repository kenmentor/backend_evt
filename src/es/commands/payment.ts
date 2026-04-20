import { createCommands } from 'evtstore';
import type { PaymentEvt, PaymentAgg, PaymentCmd } from '../types/payment';
import { domain } from '../domain';

export const paymentCmd = createCommands<PaymentEvt, PaymentAgg, PaymentCmd>(domain.payments, {
  async initiate(cmd, agg) {
    if (agg.version > 0) throw new Error('Payment already initiated');
    return {
      type: 'paymentInitiated',
      host: cmd.host,
      guest: cmd.guest,
      house: cmd.house,
      note: cmd.note,
      amount: cmd.amount,
      method: cmd.method,
      paymentRef: cmd.paymentRef,
      performedBy: cmd.performedBy,
    };
  },

  async complete(cmd, agg) {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'pending') throw new Error('Payment already processed');
    return {
      type: 'paymentCompleted',
      performedBy: cmd.performedBy,
    };
  },

  async fail(cmd, agg) {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'pending') throw new Error('Payment already processed');
    return {
      type: 'paymentFailed',
      performedBy: cmd.performedBy,
    };
  },

  async requestRefund(cmd, agg) {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'completed') throw new Error('Can only refund completed payments');
    return {
      type: 'paymentRefundRequested',
      performedBy: cmd.performedBy,
    };
  },

  async refund(cmd, agg) {
    if (agg.version === 0) throw new Error('Payment not found');
    if (agg.status !== 'refund_requested') throw new Error('Refund not requested');
    return {
      type: 'paymentRefunded',
      refundAmount: cmd.refundAmount,
      performedBy: cmd.performedBy,
    };
  },
});