/**
 * Favorite Event Repository - MongoDB Version
 */

const EventRepository = require('./EventRepository');

const initialState = { userId: null, houseId: null };

const fold = (evt, state) => {
  switch (evt.type) {
    case 'added': return { userId: evt.userId, houseId: evt.houseId };
    case 'removed': return { houseId: null };
    default: return {};
  }
};

const eventHandlers = {
  added: async (id, evt, repo) => repo._addToReadModel(id, { userId: evt.userId, houseId: evt.houseId }),
  removed: async (id, _, repo) => repo._updateInReadModel(id, { houseId: null }),
};

const commands = {
  add: async (cmd, agg) => { if (agg.version > 0) throw new Error('Favorite already exists'); return { type: 'added', userId: cmd.userId, houseId: cmd.houseId }; },
  remove: async (_, agg) => { if (agg.version === 0) throw new Error('Favorite not found'); if (!agg.houseId) return; return { type: 'removed' }; },
};

let favoriteEventRepo = null;

function createFavoriteEventRepo(readModelCollection) {
  if (favoriteEventRepo) return favoriteEventRepo;
  favoriteEventRepo = new EventRepository('favorite', 'favorite-events', { initialState, fold, commands, eventHandlers }, readModelCollection);
  favoriteEventRepo._initEventSourcing();
  return favoriteEventRepo;
}

module.exports = { createFavoriteEventRepo };
