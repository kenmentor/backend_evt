const { createProvider, migrate } = require('evtstore/provider/mongo');

let provider = null;
let initialized = false;

async function initProvider(eventCollection, bookmarkCollection) {
  if (initialized && provider) return provider;

  if (!eventCollection || !bookmarkCollection) {
    throw new Error('Collections required');
  }

  await migrate(eventCollection, bookmarkCollection);

  provider = createProvider({
    events: eventCollection,
    bookmarks: bookmarkCollection,
    limit: 1000,
    onError: (err, stream) => {
      console.error(`ES Provider error in ${stream}:`, err);
    },
  });

  initialized = true;
  console.log('✅ ES Provider initialized');
  return provider;
}

function getProvider() {
  if (!provider) {
    throw new Error('ES Provider not initialized. Call initProvider() first.');
  }
  return provider;
}

async function migrateCollections(eventCollection, bookmarkCollection) {
  await migrate(eventCollection, bookmarkCollection);
}

module.exports = {
  initProvider,
  getProvider,
  migrateCollections,
  provider: () => provider,
};