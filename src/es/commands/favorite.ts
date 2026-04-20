import { createCommands } from 'evtstore';
import type { FavoriteEvt, FavoriteAgg, FavoriteCmd } from '../types/favorite';
import { domain } from '../domain';

export const favoriteCmd = createCommands<FavoriteEvt, FavoriteAgg, FavoriteCmd>(domain.favorites, {
  async add(cmd, agg) {
    if (agg.version > 0) throw new Error('Favorite already exists');
    return {
      type: 'favoriteAdded',
      userId: cmd.userId,
      houseId: cmd.houseId,
      performedBy: cmd.performedBy,
    };
  },

  async remove(cmd, agg) {
    if (agg.version === 0) throw new Error('Favorite not found');
    return {
      type: 'favoriteRemoved',
      performedBy: cmd.performedBy,
    };
  },
});