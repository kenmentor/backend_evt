import { createProvider, migrate } from 'evtstore/provider/mongo';

let provider: ReturnType<typeof createProvider> | null = null;
let initialized = false;

export async function initProvider() {
  if (initialized) return provider!;

  const { getDb } = await import('./mongo-connection');
  const db = getDb();

  const eventCollection = db.collection('events_store');
  const bookmarkCollection = db.collection('events_bookmarks');

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

export function getESProvider() {
  if (!provider) {
    throw new Error('ES Provider not initialized. Call initProvider() first.');
  }
  return provider;
}

export { provider };