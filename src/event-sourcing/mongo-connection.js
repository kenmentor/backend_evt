/**
 * MongoDB Connection for Event Sourcing
 * 
 * Uses native MongoDB driver for evtstore compatibility.
 * Run migrations before using.
 */

const { MongoClient } = require('mongodb');
const { createProvider, migrate } = require('evtstore/provider/mongo');
require('dotenv').config();

let client = null;
let db = null;

// Cached provider instance
let provider = null;
let bookmarkCollection = null;
let eventCollection = null;

async function connect(uri = process.env.MONGO_URI) {
  if (client && client.topology && client.topology.isConnected()) {
    return { client, db };
  }

  // Close existing connection if any
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

async function setupCollections(collectionPrefix = 'events') {
  await connect();
  
  // Create collections with indexes
  const eventsColl = db.collection(`${collectionPrefix}_store`);
  const bookmarksColl = db.collection(`${collectionPrefix}_bookmarks`);

  // Run migrations
  await migrate(eventsColl, bookmarksColl);

  // Create additional indexes for read models
  await eventsColl.createIndex({ stream: 1, aggregateId: 1 });
  await eventsColl.createIndex({ timestamp: -1 });

  eventCollection = eventsColl;
  bookmarkCollection = bookmarksColl;

  return { eventCollection, bookmarkCollection };
}

function getProvider() {
  if (provider) return provider;
  
  if (!eventCollection || !bookmarkCollection) {
    throw new Error('Collections not initialized. Call setupCollections() first.');
  }

  provider = createProvider({
    events: eventCollection,
    bookmarks: bookmarkCollection,
    limit: 1000,
    onError: (err, stream, bookmark) => {
      console.error(`Event handler error in ${stream}:`, err);
    },
  });

  return provider;
}

async function close() {
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

module.exports = {
  connect,
  setupCollections,
  getProvider,
  close,
  getClient: () => client,
  getDb: () => db,
};
