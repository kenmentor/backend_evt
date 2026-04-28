import { Collection, Db, MongoClient } from 'mongodb';
import { createProvider, migrate } from 'evtstore/provider/mongo';
import { config } from 'dotenv';
import type { Provider } from 'evtstore';

config();

let client: MongoClient | null = null;
let db: Db | null = null;

let provider: Provider<any> | null = null;
let bookmarkCollection: Collection | null = null;
let eventCollection: Collection | null = null;

export async function connect(uri: string = process.env.MONGO_URI!): Promise<{ client: MongoClient; db: Db }> {
  if (client && (client as any).topology && (client as any).topology.isConnected()) {
    return { client, db: db! };
  }

  if (client) {
    try {
      await client.close();
    } catch (e) {
      console.log('Error closing existing MongoDB connection:', e);
    }
  }

  client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  db = client.db();

  console.log('✅ Event Store MongoDB Connected');
  return { client, db };
}

export async function setupCollections(
  collectionPrefix: string = 'events'
): Promise<{ eventCollection: Collection; bookmarkCollection: Collection }> {
  await connect();

  const eventsColl = db!.collection(`${collectionPrefix}_store`);
  const bookmarksColl = db!.collection(`${collectionPrefix}_bookmarks`);

  await migrate(eventsColl as any, bookmarksColl as any);

  await eventsColl.createIndex({ stream: 1, aggregateId: 1 });
  await eventsColl.createIndex({ timestamp: -1 });

  eventCollection = eventsColl;
  bookmarkCollection = bookmarksColl;

  return { eventCollection, bookmarkCollection };
}

export function getProvider(): Provider<any> {
  if (provider) return provider;

  if (!eventCollection || !bookmarkCollection) {
    throw new Error('Collections not initialized. Call setupCollections() first.');
  }

  provider = createProvider({
    events: eventCollection as any,
    bookmarks: bookmarkCollection as any,
    limit: 1000,
    onError: (err: any, stream: string, bookmark: string) => {
      console.error(`Event handler error in ${stream}:`, err);
    },
  });

  return provider;
}

export async function close(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    provider = null;
    eventCollection = null;
    bookmarkCollection = null;
    console.log('Event Store MongoDB Disconnected');
  }
}

export function getClient(): MongoClient | null {
  return client;
}

export function getDb(): Db | null {
  return db;
}
