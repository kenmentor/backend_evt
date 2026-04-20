import { createCommands } from 'evtstore';
import type { PayoutEvt, PayoutAgg, PayoutCmd } from '../types/payout';
import { domain } from '../domain';

export const payoutCmd = createCommands<PayoutEvt, PayoutAgg, PayoutCmd>(domain.payouts, {
  async create(cmd, agg) {
    if (agg.version > 0) throw new Error('Payout already exists');
    return {
      type: 'payoutCreated',
      host: cmd.host,
      agentId: cmd.agentId,
      amount: cmd.amount,
      bankName: cmd.bankName,
      accountNumber: cmd.accountNumber,
      accountName: cmd.accountName,
      performedBy: cmd.performedBy,
    };
  },

  async approve(cmd, agg) {
    if (agg.version === 0) throw new Error('Payout not found');
    if (agg.status !== 'pending') throw new Error('Payout already processed');
    return {
      type: 'payoutApproved',
      performedBy: cmd.performedBy,
    };
  },

  async reject(cmd, agg) {
    if (agg.version === 0) throw new Error('Payout not found');
    if (agg.status !== 'pending') throw new Error('Payout already processed');
    return {
      type: 'payoutRejected',
      reason: cmd.reason,
      performedBy: cmd.performedBy,
    };
  },

  async process(cmd, agg) {
    if (agg.version === 0) throw new Error('Payout not found');
    if (agg.status !== 'approved') throw new Error('Payout must be approved first');
    return {
      type: 'payoutProcessed',
      transactionRef: cmd.transactionRef,
      performedBy: cmd.performedBy,
    };
  },
});