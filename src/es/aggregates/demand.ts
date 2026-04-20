import { createAggregate } from 'evtstore';
import type { DemandEvt, DemandAgg } from '../types/demand';

export const demandAgg = createAggregate<DemandEvt, DemandAgg, 'demands'>({
  stream: 'demands',
  create: (): DemandAgg => ({
    guest: '',
    category: '',
    minPrice: 0,
    maxPrice: 0,
    location: '',
    description: '',
    deleted: false,
  }),
  fold: (evt, prev): DemandAgg => {
    switch (evt.type) {
      case 'demandCreated':
        return {
          ...prev,
          guest: evt.guest,
          category: evt.category,
          minPrice: evt.minPrice || 0,
          maxPrice: evt.maxPrice || 0,
          location: evt.location || '',
          description: evt.description || '',
          deleted: false,
        };

      case 'demandUpdated':
        return {
          ...prev,
          category: evt.category ?? prev.category,
          minPrice: evt.minPrice ?? prev.minPrice,
          maxPrice: evt.maxPrice ?? prev.maxPrice,
          location: evt.location ?? prev.location,
          description: evt.description ?? prev.description,
        };

      case 'demandDeleted':
        return {
          ...prev,
          deleted: true,
        };

      default:
        return prev;
    }
  },
});