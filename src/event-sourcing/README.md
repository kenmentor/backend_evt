# Event Sourcing Implementation Guide

## Overview

This document explains the event sourcing implementation in `src/event-sourcing/` folder. This replaces the traditional 3-layer architecture (Controllers → Services → Repositories → MongoDB) with an event-driven architecture.

---

## Architecture Comparison

### Before (Traditional 3-Layer)
```
Controller → Service → Repository → MongoDB (CRUD operations)
                                            ↓
                                     Direct Updates
```

### After (Event Sourcing)
```
Command → Event → Event Store → Event Handler → Read Model
   ↓
┌─────────────────────────────────────────────────────────────┐
│                    events_store (SOURCE OF TRUTH)            │
│                                                             │
│  { stream: "user-events", event: { type: "registered" } }  │
│  { stream: "booking-events", event: { type: "created" } }   │
│  { stream: "analytics-events", event: { type: "tracked" } } │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    users     │  │  resources   │  │  bookings    │  ← READ MODELS
│  (collection)│  │  (collection)│  │  (collection)│
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Event Sourcing Data Flow

```
1. USER ACTION (e.g., upload a house)
        ↓
2. SERVICE calls repository.create({ data })
        ↓
3. COMMAND HANDLER creates an EVENT
   └── e.g., { type: 'created', title: 'My House', price: 100 }
        ↓
4. EVENT is SAVED to events_store (SOURCE OF TRUTH)
   └── This is permanent, never modified
        ↓
5. EVENT HANDLER sees new event
        ↓
6. READ MODEL is UPDATED
   └── resources collection gets the new house
        ↓
7. SERVICE returns data from READ MODEL
```

---

## Folder Structure

```
src/event-sourcing/
│
├── 1-mongo-connection.js       ← Database connection setup
├── 2-EventRepository.js       ← Base class for all repos
├── 3-init.js                  ← Initializes all repos on startup
│
├── 4-user-event-repository.js
├── 5-resource-event-repository.js
├── 6-booking-event-repository.js
├── 7-payment-event-repository.js
├── 8-chat-event-repository.js
├── 9-tour-event-repository.js
├── 10-request-event-repository.js
├── 11-favorite-event-repository.js
├── 12-feedback-event-repository.js
├── 13-demand-event-repository.js
├── 14-payout-event-repository.js
└── 15-analytics-event-repository.js
```

---

## File by File Explanation

---

### 1. `mongo-connection.js`

**Purpose:** Connects to MongoDB and sets up the event store infrastructure.

```javascript
const { MongoClient } = require('mongodb');
const { createProvider, migrate } = require('evtstore/provider/mongo');
```

**What it does:**

1. **Creates MongoDB connection** using native driver (not Mongoose)
   ```javascript
   client = new MongoClient(uri, {
     maxPoolSize: 10,
     minPoolSize: 1,
     connectTimeoutMS: 10000,
     socketTimeoutMS: 45000,
   });
   ```

2. **Sets up event store collections:**
   - `events_store` - Stores all events from all aggregates
   - `events_bookmarks` - Stores handler positions (so they know where to resume)

3. **Creates the evtstore provider:**
   ```javascript
   provider = createProvider({
     events: eventCollection,      // events_store
     bookmarks: bookmarkCollection, // events_bookmarks
     limit: 1000,                  // Max events per query
   });
   ```

**Exports:**
- `connect()` - Connect to MongoDB
- `setupCollections()` - Create event store collections
- `getProvider()` - Get the evtstore provider
- `close()` - Close connection

---

### 2. `EventRepository.js`

**Purpose:** Base class that provides event sourcing functionality to all repositories.

```javascript
class EventRepository {
  constructor(aggregateName, streamName, schema, readModelCollection)
}
```

**Key Components:**

#### A. Constructor Parameters
```javascript
aggregateName      // e.g., 'user', 'resource', 'booking'
streamName         // e.g., 'user-events', 'resource-events'
schema             // { initialState, fold, commands, eventHandlers }
readModelCollection // MongoDB collection for read model
```

#### B. `_initEventSourcing()` Method

Sets up the evtstore infrastructure:

```javascript
_initEventSourcing() {
  // 1. Create aggregate with initial state and fold function
  this.storableAggregate = evtstore.createAggregate({
    stream: this.streamName,
    create: () => ({ ...this.schema.initialState }),
    fold: this.schema.fold,
  });

  // 2. Create domain (container for aggregates)
  const { domain, createHandler } = evtstore.createDomainV2(
    { provider },
    { [this.aggregateName]: this.storableAggregate }
  );

  // 3. Create commands (functions that generate events)
  this.commands = evtstore.createCommands(
    this.domain[this.aggregateName],
    this.schema.commands
  );

  // 4. Initialize event handler
  this._initEventHandler();
}
```

#### C. CRUD Methods

These are the methods your services call:

```javascript
// CREATE - Creates new entity
async create(data) {
  const id = data._id || new mongoose.Types.ObjectId().toString();
  const { _id, ...createData } = data;

  // Find the 'create' command (could also be 'register', 'add', 'insert')
  await this.commands.create(id, createData);

  // Run event handler to update read model
  await this.handler.runOnce();

  // Return from read model
  return this.findById(id);
}

// UPDATE - Updates existing entity
async update(key, data) {
  await this.commands.update(key, data);
  await this.handler.runOnce();
  return this.findById(key);
}

// DELETE - Soft deletes entity
async delete(id) {
  await this.commands.delete(id, {});
  await this.handler.runOnce();
  return this.findById(id);
}

// READ - Direct from read model
async find(query) {
  return this.readModelCollection.find(query).toArray();
}
async findOne(query) {
  return this.readModelCollection.findOne(query);
}
async findById(id) {
  return this.readModelCollection.findOne({ _id: id });
}
async findAll() {
  return this.readModelCollection.find({}).toArray();
}
```

#### D. Read Model Helper Methods

Used by event handlers to update read models:

```javascript
// Add new document to read model
async _addToReadModel(id, data) {
  await this.readModelCollection.updateOne(
    { _id: id },
    {
      $set: { ...data, updatedAt: new Date() },
      $setOnInsert: { _id: id, createdAt: new Date() },
    },
    { upsert: true }
  );
}

// Update existing document
async _updateInReadModel(id, data) {
  await this.readModelCollection.updateOne(
    { _id: id },
    { $set: { ...data, updatedAt: new Date() } }
  );
}
```

---

### 3. `index.js`

**Purpose:** Initializes all event repositories when the server starts.

```javascript
async function initAll() {
  // 1. Connect to MongoDB and setup event store
  const { eventCollection, bookmarkCollection } = await setupCollections();

  // 2. Get database instance
  const db = getDb();

  // 3. Create read model collections (same names as old MongoDB collections)
  const usersColl = db.collection('users');
  const resourcesColl = db.collection('resources');
  const bookingsColl = db.collection('bookings');
  // ... etc

  // 4. Create indexes for fast queries
  await createIndexSafe(usersColl, { email: 1 }, { unique: true });
  await createIndexSafe(resourcesColl, { host: 1 });
  // ... etc

  // 5. Import and create all repositories
  const { createUserEventRepo } = require('./user-event-repository');
  // ... etc

  // 6. Store in global repos object
  repos = {
    userEventRepo: createUserEventRepo(usersColl),
    resourceEventRepo: createResourceEventRepo(resourcesColl),
    // ... etc
  };
}
```

**Usage:**
```javascript
// In src/index.js
const { initAll, getRepos } = require('./event-sourcing');

async function startServer() {
  await initAll();
  // Now you can use:
  const { userEventRepo } = getRepos();
}
```

---

## Aggregate Repositories

Each aggregate repository follows the same pattern. Let's use `resource-event-repository.js` (houses/properties) as the example:

### Structure

```javascript
const EventRepository = require('./EventRepository');

// 1. INITIAL STATE - What the entity looks like when created
const initialState = {
  host: null,
  title: '',
  description: '',
  type: '',
  category: '',
  price: '',
  // ... etc
};

// 2. FOLD FUNCTION - How events transform state
const fold = (evt, state) => {
  switch (evt.type) {
    case 'created':
      return { /* new state */ };
    case 'priceUpdated':
      return { price: evt.price };
    default:
      return {};
  }
};

// 3. EVENT HANDLERS - Update read models when events occur
const eventHandlers = {
  created: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      title: evt.title,
      price: evt.price,
      // ... etc
    });
  },
  priceUpdated: async (id, evt, repo) => {
    await repo._updateInReadModel(id, { price: evt.price });
  },
};

// 4. COMMANDS - Functions that create events
const commands = {
  create: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Already exists');
    return { type: 'created', title: cmd.title, price: cmd.price };
  },
  updatePrice: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Not found');
    return { type: 'priceUpdated', price: cmd.price };
  },
};

// 5. FACTORY FUNCTION - Creates the repository
let resourceEventRepo = null;

function createResourceEventRepo(readModelCollection) {
  if (resourceEventRepo) return resourceEventRepo;

  resourceEventRepo = new EventRepository(
    'resource',           // aggregateName
    'resource-events',    // streamName
    { initialState, fold, commands, eventHandlers },
    readModelCollection   // users collection
  );

  resourceEventRepo._initEventSourcing();
  return resourceEventRepo;
}

module.exports = { createResourceEventRepo };
```

### Each Component Explained

#### A. `initialState`

The starting state when a new entity is created:

```javascript
const initialState = {
  host: null,
  title: '',
  description: '',
  type: '',
  category: '',
  price: '',
  address: '',
  state: '',
  lga: '',
  location: '',
  bedrooms: 1,
  bathrooms: 1,
  furnishing: '',
  amenities: [],
  images: [],
  video: null,
  thumbnail: null,
  views: 0,
  avaliable: true,
};
```

#### B. `fold` Function

Transforms events into state. This is how evtstore knows the current state of an aggregate:

```javascript
const fold = (evt, state) => {
  switch (evt.type) {
    case 'created':
      // New entity
      return {
        host: evt.host,
        title: evt.title,
        description: evt.description,
        category: evt.category,
        price: evt.price,
        // Only include fields from this event
      };

    case 'priceUpdated':
      // Update specific field
      return { price: evt.price };

    case 'mediaAdded':
      // Append to array
      return { images: [...state.images, ...evt.images] };

    default:
      // No change
      return {};
  }
};
```

**Important:** `fold` returns a PARTIAL state. evtstore merges it with the previous state.

#### C. `eventHandlers`

Functions that update the read model (MongoDB collection) when events occur:

```javascript
const eventHandlers = {
  created: async (id, evt, repo) => {
    // Add new document to read model
    await repo._addToReadModel(id, {
      host: evt.host,
      title: evt.title,
      // ... all fields
    });
  },

  priceUpdated: async (id, evt, repo) => {
    // Update specific fields
    await repo._updateInReadModel(id, {
      price: evt.price,
    });
  },

  mediaAdded: async (id, evt, repo) => {
    // Get existing to merge arrays
    const existing = await repo.findById(id);
    const currentImages = existing ? existing.images : [];
    await repo._updateInReadModel(id, {
      images: [...currentImages, ...evt.images],
    });
  },
};
```

**Note:** `eventHandlers` are for the READ MODEL (what users see).
**Note:** `fold` is for the AGGREGATE STATE (what commands check).

#### D. `commands`

Functions that generate events. This is where business logic lives:

```javascript
const commands = {
  create: async (cmd, agg) => {
    // agg.version === 0 means new entity
    if (agg.version > 0) throw new Error('Already exists');

    // Return event to be saved
    return {
      type: 'created',
      host: cmd.host,
      title: cmd.title,
      description: cmd.description,
      // ... all fields
    };
  },

  updatePrice: async (cmd, agg) => {
    // agg.version === 0 means entity doesn't exist
    if (agg.version === 0) throw new Error('Not found');

    // Check if already same price (idempotency)
    if (agg.price === cmd.price) return;

    return { type: 'priceUpdated', price: cmd.price };
  },
};
```

**Command Parameters:**
- `cmd` - The data passed from the service
- `agg` - The current aggregate state (from folding all events)

---

## How to Add a New Aggregate

### Example: Creating a "Review" aggregate

**Step 1:** Create the file `src/event-sourcing/review-event-repository.js`

```javascript
const EventRepository = require('./EventRepository');

const initialState = {
  author: null,
  targetId: null,
  targetType: '',  // 'resource', 'host', 'booking'
  rating: 0,
  comment: '',
  status: 'pending',  // pending, approved, rejected
  createdAt: null,
};

const fold = (evt, state) => {
  switch (evt.type) {
    case 'created':
      return {
        author: evt.author,
        targetId: evt.targetId,
        targetType: evt.targetType,
        rating: evt.rating,
        comment: evt.comment,
        status: 'pending',
        createdAt: new Date(),
      };
    case 'approved':
      return { status: 'approved' };
    case 'rejected':
      return { status: 'rejected' };
    default:
      return {};
  }
};

const eventHandlers = {
  created: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      author: evt.author,
      targetId: evt.targetId,
      targetType: evt.targetType,
      rating: evt.rating,
      comment: evt.comment,
      status: 'pending',
    });
  },
  approved: async (id, _, repo) => {
    await repo._updateInReadModel(id, { status: 'approved' });
  },
  rejected: async (id, _, repo) => {
    await repo._updateInReadModel(id, { status: 'rejected' });
  },
};

const commands = {
  create: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Review already exists');
    return {
      type: 'created',
      author: cmd.author,
      targetId: cmd.targetId,
      targetType: cmd.targetType,
      rating: cmd.rating,
      comment: cmd.comment,
    };
  },
  approve: async (_, agg) => {
    if (agg.version === 0) throw new Error('Review not found');
    if (agg.status !== 'pending') return;
    return { type: 'approved' };
  },
  reject: async (_, agg) => {
    if (agg.version === 0) throw new Error('Review not found');
    if (agg.status !== 'pending') return;
    return { type: 'rejected' };
  },
};

let reviewEventRepo = null;

function createReviewEventRepo(readModelCollection) {
  if (reviewEventRepo) return reviewEventRepo;

  reviewEventRepo = new EventRepository(
    'review',
    'review-events',
    { initialState, fold, commands, eventHandlers },
    readModelCollection
  );

  reviewEventRepo._initEventSourcing();
  return reviewEventRepo;
}

module.exports = { createReviewEventRepo };
```

**Step 2:** Add to `src/event-sourcing/index.js`

```javascript
// Import
const { createReviewEventRepo } = require('./review-event-repository');

// In initAll(), after creating collections:
const reviewsColl = db.collection('reviews');

// In repos object:
repos = {
  // ... existing repos
  reviewEventRepo: createReviewEventRepo(reviewsColl),
};
```

**Step 3:** Create indexes

```javascript
createIndexSafe(reviewsColl, { author: 1 });
createIndexSafe(reviewsColl, { targetId: 1, targetType: 1 });
createIndexSafe(reviewsColl, { status: 1 });
createIndexSafe(reviewsColl, { rating: 1 });
```

**Step 4:** Create service (or update existing)

```javascript
// src/service/review-service.js
const { getRepos } = require('../event-sourcing');

function getReviewRepo() {
  const { reviewEventRepo } = getRepos();
  return reviewEventRepo;
}

async function createReview(data) {
  const repo = getReviewRepo();
  const mongoose = require('mongoose');
  const reviewId = new mongoose.Types.ObjectId().toString();

  await repo.create({
    _id: reviewId,
    author: data.author,
    targetId: data.targetId,
    targetType: data.targetType,
    rating: data.rating,
    comment: data.comment,
  });

  return await repo.findById(reviewId);
}

async function approveReview(reviewId) {
  const repo = getReviewRepo();
  await repo.commands.approve(reviewId);
  await repo.handler.runOnce();
  return await repo.findById(reviewId);
}

module.exports = {
  createReview,
  approveReview,
};
```

---

## Database Collections

### Event Store Collections (evtstore manages)

| Collection | Purpose |
|------------|---------|
| `events_store` | Stores ALL events from ALL aggregates |
| `events_bookmarks` | Stores handler positions |

### Read Model Collections (your data)

| Collection | Aggregate |
|------------|----------|
| `users` | user-event-repository |
| `resources` | resource-event-repository |
| `bookings` | booking-event-repository |
| `payments` | payment-event-repository |
| `conversations` | chat-event-repository |
| `messages` | chat-event-repository |
| `tours` | tour-event-repository |
| `requests` | request-event-repository |
| `favorites` | favorite-event-repository |
| `feedbacks` | feedback-event-repository |
| `demands` | demand-event-repository |
| `payouts` | payout-event-repository |
| `analytics` | analytics-event-repository |

---

## Event Store Schema

### `events_store` Collection

Each document represents ONE event:

```javascript
{
  _id: "69d238df171fbc39d51fd80b",        // Event ID
  stream: "resource-events",               // Which aggregate
  aggregateId: "69d238dfc28fcb83634803aa", // Entity ID
  position: { "$timestamp": "..." },       // Position for ordering
  version: 1,                              // Event number for this entity
  timestamp: "2026-04-05T10:26:39.386Z",  // When event occurred
  event: {                                  // THE ACTUAL EVENT
    type: "created",
    title: "My House",
    price: 100,
    // ... event-specific data
  }
}
```

### `events_bookmarks` Collection

Stores where each handler has processed up to:

```javascript
{
  _id: "resource-handler",       // Handler name
  position: { "$timestamp": "..." }  // Last processed position
}
```

---

## Commands vs Events vs Read Models

### Commands
- **What:** Functions that handle business logic
- **Who calls:** Services
- **Output:** Events
- **Location:** `commands` object in repository

```javascript
// Service calls command
await repo.commands.updatePrice(houseId, { price: 200 });

// Command checks business logic
if (agg.price === 200) return; // No change needed
return { type: 'priceUpdated', price: 200 };
```

### Events
- **What:** Immutable facts that happened
- **Who creates:** Commands
- **Where stored:** `events_store` collection
- **Purpose:** Source of truth

```javascript
// Stored in database
{
  type: 'priceUpdated',
  price: 200,
  timestamp: '...'
}
```

### Read Models
- **What:** Optimized views for reading
- **Who updates:** Event handlers
- **Where stored:** Regular collections (users, resources, etc.)
- **Purpose:** Fast queries for API responses

```javascript
// Event handler updates read model
await repo._updateInReadModel(id, { price: 200 });

// Service returns from read model
return await repo.findById(id);
```

---

## Benefits of This Architecture

1. **Complete Audit Trail** - Every change is recorded as an event
2. **Time Travel** - Can replay events to get state at any point in time
3. **Multiple Views** - Same events can update different read models
4. **Eventual Consistency** - Read models update asynchronously
5. **Debugging** - Can see exactly what happened and when
6. **Scalability** - Event store is append-only (very fast writes)

---

## Troubleshooting

### Event not updating read model?

Check:
1. Event handler for that event type exists
2. Handler is registered with `this.handler.handle(stream, eventType, fn)`
3. Handler calls `_addToReadModel` or `_updateInReadModel`

### Command throwing error?

Check:
1. Entity exists (agg.version > 0 for updates)
2. Business logic conditions are met
3. Idempotency checks pass

### Handler not running?

Check:
1. `handler.start()` was called
2. Bookmark exists in `events_bookmarks`
3. `handler.runOnce()` processes events

---

## Quick Reference

### Service → Repository Pattern

```javascript
// Service
const repo = getSomeRepo();
await repo.create({ data });
return await repo.findById(id);

// Repository create() method
await this.commands.create(id, data);
await this.handler.runOnce();
return this.findById(id);

// Command returns event
return { type: 'created', ...data };

// Event handler updates read model
await repo._addToReadModel(id, { ...data });
```

### Key evtstore Functions

```javascript
evtstore.createAggregate({ stream, create, fold })
evtstore.createDomainV2({ provider }, aggregates)
evtstore.createCommands(aggregate, handlers)
handler.handle(stream, eventType, fn)
handler.start()
handler.runOnce()
```

---

## File Summary

| File | Purpose |
|------|---------|
| `mongo-connection.js` | Database connection + evtstore provider |
| `EventRepository.js` | Base class with CRUD, commands, handlers |
| `index.js` | Initializes all repositories on startup |
| `*-event-repository.js` | Each aggregate's commands, events, handlers |

---

## Migration from Traditional to Event Sourcing

### Before
```javascript
// Repository (old)
async create(data) {
  return await UserModel.create(data);
}
```

### After
```javascript
// Repository (new)
async create(data) {
  await this.commands.create(id, data);
  await this.handler.runOnce();
  return this.findById(id);
}
```

### Service (stays the same)
```javascript
// Service - unchanged!
async createUser(data) {
  const repo = getUserRepo();
  return await repo.create(data);
}
```

---

## Summary

1. **Commands** handle business logic and create **Events**
2. **Events** are immutable and stored in **events_store**
3. **Event Handlers** read events and update **Read Models**
4. **Read Models** are regular collections for fast queries
5. **evtstore** manages the event store and bookmarks
6. **EventRepository** provides the CRUD interface to services

This architecture gives you complete audit trails while maintaining fast read performance through optimized read models.
