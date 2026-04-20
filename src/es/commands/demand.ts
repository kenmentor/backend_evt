import { createCommands } from 'evtstore';
import type { DemandEvt, DemandAgg, DemandCmd } from '../types/demand';
import { domain } from '../domain';

export const demandCmd = createCommands<DemandEvt, DemandAgg, DemandCmd>(domain.demands, {
  async create(cmd, agg) {
    if (agg.version > 0) throw new Error('Demand already exists');
    return {
      type: 'demandCreated',
      guest: cmd.guest,
      category: cmd.category,
      minPrice: cmd.minPrice,
      maxPrice: cmd.maxPrice,
      location: cmd.location,
      description: cmd.description,
      performedBy: cmd.performedBy,
    };
  },

  async update(cmd, agg) {
    if (agg.version === 0) throw new Error('Demand not found');
    if (agg.deleted) throw new Error('Demand is deleted');
    return {
      type: 'demandUpdated',
      category: cmd.category,
      minPrice: cmd.minPrice,
      maxPrice: cmd.maxPrice,
      location: cmd.location,
      description: cmd.description,
      performedBy: cmd.performedBy,
    };
  },

  async delete(cmd, agg) {
    if (agg.version === 0) throw new Error('Demand not found');
    if (agg.deleted) throw new Error('Demand already deleted');
    return {
      type: 'demandDeleted',
      performedBy: cmd.performedBy,
    };
  },
});