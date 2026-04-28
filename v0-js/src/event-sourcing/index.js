/**
 * Event Repositories - MongoDB Production Version
 * 
 * Initialize all event repositories with MongoDB collections.
 * 
 * Usage:
 * 
 * const { initAll, userEventRepo, bookingEventRepo } = require('./event-sourcing');
 * 
 * async function main() {
 *   await initAll();
 *   // Use repositories...
 * }
 */

const { setupCollections, getDb } = require('./mongo-connection');

// Lazy-loaded repositories
let initialized = false;
let repos = {};

async function initAll(collectionPrefix = 'events') {
  if (initialized) return repos;

  const { eventCollection, bookmarkCollection } = await setupCollections(collectionPrefix);
  const db = getDb();

  // Create read model collections with indexes
  const usersColl = db.collection('users');
  const resourcesColl = db.collection('resources');
  const bookingsColl = db.collection('bookings');
  const paymentsColl = db.collection('payments');
  const conversationsColl = db.collection('conversations');
  const messagesColl = db.collection('messages');
  const toursColl = db.collection('tours');
  const requestsColl = db.collection('requests');
  const favoritesColl = db.collection('favorites');
  const feedbacksColl = db.collection('feedbacks');
  const demandsColl = db.collection('demands');
  const payoutsColl = db.collection('payouts');
  const analyticsColl = db.collection('analytics');

  // Skip index creation if they already exist (suppress errors)
  const createIndexSafe = async (coll, index, options = {}) => {
    try {
      await coll.createIndex(index, { ...options, background: true });
    } catch (e) {
      // Index already exists, ignore
    }
  };

  // Create indexes for read models
  await Promise.all([
    createIndexSafe(usersColl, { email: 1 }, { unique: true, sparse: true }),
    createIndexSafe(usersColl, { role: 1 }),
    createIndexSafe(usersColl, { disabled: 1 }),
    createIndexSafe(usersColl, { createdAt: -1 }),

    createIndexSafe(resourcesColl, { host: 1 }),
    createIndexSafe(resourcesColl, { avaliable: 1, state: 1 }),
    createIndexSafe(resourcesColl, { category: 1 }),
    createIndexSafe(resourcesColl, { price: 1 }),
    createIndexSafe(resourcesColl, { createdAt: -1 }),

    createIndexSafe(bookingsColl, { host: 1 }),
    createIndexSafe(bookingsColl, { guest: 1 }),
    createIndexSafe(bookingsColl, { status: 1 }),
    createIndexSafe(bookingsColl, { house: 1 }),

    createIndexSafe(paymentsColl, { host: 1 }),
    createIndexSafe(paymentsColl, { guest: 1 }),
    createIndexSafe(paymentsColl, { status: 1 }),
    createIndexSafe(paymentsColl, { paymentRef: 1 }),

    createIndexSafe(conversationsColl, { participants: 1 }),
    createIndexSafe(conversationsColl, { updatedAt: -1 }),

    createIndexSafe(messagesColl, { conversationId: 1, createdAt: -1 }),
    createIndexSafe(messagesColl, { senderId: 1 }),
    createIndexSafe(messagesColl, { receiverId: 1 }),

    createIndexSafe(toursColl, { guestId: 1 }),
    createIndexSafe(toursColl, { hostId: 1 }),
    createIndexSafe(toursColl, { status: 1 }),

    createIndexSafe(requestsColl, { host: 1 }),
    createIndexSafe(requestsColl, { guest: 1 }),

    createIndexSafe(favoritesColl, { userId: 1, houseId: 1 }, { unique: true }),

    createIndexSafe(demandsColl, { guest: 1 }),
    createIndexSafe(demandsColl, { category: 1 }),

    createIndexSafe(payoutsColl, { agentId: 1 }),
    createIndexSafe(payoutsColl, { status: 1 }),

    createIndexSafe(analyticsColl, { timestamp: -1 }),
    createIndexSafe(analyticsColl, { type: 1, timestamp: -1 }),
    createIndexSafe(analyticsColl, { userId: 1, timestamp: -1 }),
  ]);

  // Import and create repositories
  const { createUserEventRepo } = require('./user-event-repository');
  const { createResourceEventRepo } = require('./resource-event-repository');
  const { createBookingEventRepo } = require('./booking-event-repository');
  const { createPaymentEventRepo } = require('./payment-event-repository');
  const { createConversationEventRepo, createMessageEventRepo } = require('./chat-event-repository');
  const { createTourEventRepo } = require('./tour-event-repository');
  const { createRequestEventRepo } = require('./request-event-repository');
  const { createFavoriteEventRepo } = require('./favorite-event-repository');
  const { createFeedbackEventRepo } = require('./feedback-event-repository');
  const { createDemandEventRepo } = require('./demand-event-repository');
  const { createPayoutEventRepo } = require('./payout-event-repository');
  const { createAnalyticsEventRepo } = require('./analytics-event-repository');

  repos = {
    userEventRepo: createUserEventRepo(usersColl),
    resourceEventRepo: createResourceEventRepo(resourcesColl),
    bookingEventRepo: createBookingEventRepo(bookingsColl),
    paymentEventRepo: createPaymentEventRepo(paymentsColl),
    conversationEventRepo: createConversationEventRepo(conversationsColl),
    messageEventRepo: createMessageEventRepo(messagesColl),
    tourEventRepo: createTourEventRepo(toursColl),
    requestEventRepo: createRequestEventRepo(requestsColl),
    favoriteEventRepo: createFavoriteEventRepo(favoritesColl),
    feedbackEventRepo: createFeedbackEventRepo(feedbacksColl),
    demandEventRepo: createDemandEventRepo(demandsColl),
    payoutEventRepo: createPayoutEventRepo(payoutsColl),
    analyticsEventRepo: createAnalyticsEventRepo(analyticsColl),
  };

  initialized = true;
  console.log('✅ All event repositories initialized');
  return repos;
}

function getRepos() {
  if (!initialized) {
    throw new Error('Repositories not initialized. Call initAll() first.');
  }
  return repos;
}

module.exports = {
  initAll,
  getRepos,
  ...require('./mongo-connection'),
};
