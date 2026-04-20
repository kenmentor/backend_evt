import { createCommands } from 'evtstore';
import type { RequestEvt, RequestAgg, RequestCmd } from '../types/request';
import { domain } from '../domain';

export const requestCmd = createCommands<RequestEvt, RequestAgg, RequestCmd>(domain.requests, {
  async create(cmd, agg) {
    if (agg.version > 0) throw new Error('Request already exists');
    return {
      type: 'requestCreated',
      guest: cmd.guest,
      host: cmd.host,
      house: cmd.house,
      checkIn: cmd.checkIn,
      checkOut: cmd.checkOut,
      guests: cmd.guests,
      totalPrice: cmd.totalPrice,
      note: cmd.note,
      performedBy: cmd.performedBy,
    };
  },

  async approve(cmd, agg) {
    if (agg.version === 0) throw new Error('Request not found');
    if (agg.status !== 'pending') throw new Error('Request already processed');
    return {
      type: 'requestApproved',
      performedBy: cmd.performedBy,
    };
  },

  async reject(cmd, agg) {
    if (agg.version === 0) throw new Error('Request not found');
    if (agg.status !== 'pending') throw new Error('Request already processed');
    return {
      type: 'requestRejected',
      reason: cmd.reason,
      performedBy: cmd.performedBy,
    };
  },

  async cancel(cmd, agg) {
    if (agg.version === 0) throw new Error('Request not found');
    if (agg.status !== 'pending') throw new Error('Request already processed');
    return {
      type: 'requestCancelled',
      performedBy: cmd.performedBy,
    };
  },
});