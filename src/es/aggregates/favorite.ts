import { createAggregate } from 'evtstore';
import type { FavoriteEvt, FavoriteAgg } from '../types/favorite';

export const favoriteAgg = createAggregate<FavoriteEvt, FavoriteAgg, 'favorites'>({
  stream: 'favorites',
  create: (): FavoriteAgg => ({
    userId: '',
    houseId: '',
  }),
  fold: (evt, prev): FavoriteAgg => {
    switch (evt.type) {
      case 'favoriteAdded':
        return {
          ...prev,
          userId: evt.userId,
          houseId: evt.houseId,
        };

      case 'favoriteRemoved':
        return {
          ...prev,
          userId: '',
          houseId: '',
        };

      default:
        return prev;
    }
  },
});