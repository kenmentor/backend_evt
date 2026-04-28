/**
 * Favorite Event Repository - MongoDB Version (Updated)
 * Event naming: favoriteAdded, favoriteRemoved
 */

const EventRepository = require('./EventRepository');

const initialState = { userId: null, houseId: null };

const fold = (evt, state) => {
  switch (evt.type) {
    case 'favoriteAdded': return { userId: evt.userId, houseId: evt.houseId };
    case 'favoriteRemoved': return { houseId: null };
    default: return {};
  }
};

const eventHandlers = {
  favoriteAdded: async (id, evt, repo) => repo._addToReadModel(id, { userId: evt.userId, houseId: evt.houseId }),
  favoriteRemoved: async (id, _, repo) => repo._updateInReadModel(id, { houseId: null }),
};

const commands = {
  add: async (cmd, agg) => { if (agg.version > 0) throw new Error('Favorite already exists'); return { type: 'favoriteAdded', userId: cmd.userId, houseId: cmd.houseId }; },
  remove: async (_, agg) => { if (agg.version === 0) throw new Error('Favorite not found'); if (!agg.houseId) return; return { type: 'favoriteRemoved' }; },
};

let favoriteEventRepo = null;

function createFavoriteEventRepo(readModelCollection) {
  if (favoriteEventRepo) return favoriteEventRepo;
  favoriteEventRepo = new EventRepository('favorite', 'favorite-events', { initialState, fold, commands, eventHandlers }, readModelCollection);
  favoriteEventRepo._initEventSourcing();
  return favoriteEventRepo;
}

module.exports = { createFavoriteEventRepo };