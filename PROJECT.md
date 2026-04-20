# Backend Event Sourcing Migration

## What Was Changed

This project migrated from a **traditional 3-layer architecture** to **event sourcing**.

### Before (Traditional)
```
API Request → Service → Repository → MongoDB (direct CRUD)
                                    ↓
                             Direct Updates
```

### After (Event Sourcing)
```
API Request → Service → Repository → Event Store → Read Model
                                        ↓
                              ┌─────────────────────────┐
                              │    events_store        │  ← Source of Truth
                              │ (immutable events)     │
                              └─────────────────────────┘
                                        ↓
                              ┌─────────────────────────┐
                              │ users, resources, etc.   │  ← Read Models
                              │ (optimized for reads)     │
                              └─────────────────────────┘
```

---

## Why Event Sourcing?

| Benefit | Description |
|---------|-------------|
| **Audit Trail** | Every change is an event - full history |
| **Time Travel** | Replay events to see state at any point |
| **Debugging** | See exactly what happened and when |
| **Scalability** | Append-only writes are very fast |

---

## Core Concepts

### 1. Events
Immutable records of what happened:

```javascript
// Stored in events_store collection
{
  stream: "user-events",           // Which aggregate (user, resource, etc.)
  aggregateId: "abc123",           // The entity ID
  version: 1,                  // Event number for this entity
  event: {
    type: "registered",          // "created", "updated", "deleted", etc.
    email: "user@example.com",
    name: "John"
  }
}
```

### 2. Commands
Functions that handle business logic and create events:

```javascript
// In user-event-repository.js
const commands = {
  create: async (cmd, agg) => {
    // agg.version === 0 means new entity
    if (agg.version > 0) throw new Error('Already exists');

    // Return event to be saved (NOT directly saving)
    return {
      type: 'registered',
      email: cmd.email,
      name: cmd.name
    };
  }
};
```

### 3. Fold Function
Transforms events into aggregate state:

```javascript
const fold = (evt, state) => {
  switch (evt.type) {
    case 'registered':
      return { email: evt.email, name: evt.name, status: 'active' };
    case 'emailChanged':
      return { email: evt.email };
    default:
      return {};
  }
};
```

### 4. Event Handlers
Update read models when events occur:

```javascript
const eventHandlers = {
  registered: async (id, evt, repo) => {
    // Add to read model (users collection)
    await repo._addToReadModel(id, {
      email: evt.email,
      name: evt.name,
      status: 'active'
    });
  },

  emailChanged: async (id, evt, repo) => {
    // Update read model
    await repo._updateInReadModel(id, {
      email: evt.email
    });
  }
};
```

### 5. Read Models
Regular MongoDB collections optimized for API queries:

```javascript
// users collection (read model)
{
  _id: "abc123",
  email: "user@example.com",
  name: "John",
  status: "active"
}
```

---

## Data Flow

```
1. API Request arrives
        ↓
2. Service calls repo.create(data)
        ↓
3. Repository calls command (e.g., "create")
        ↓
4. Command validates business logic
        ↓
5. Command returns EVENT (not saved yet)
        ↓
6. evtstore saves EVENT to events_store
        ↓
7. Event handler sees new event
        ↓
8. Handler updates READ MODEL
        ↓
9. repo.findById() returns from read model
```

---

## File Structure

```
src/event-sourcing/
├── mongo-connection.js       # MongoDB connection + evtstore provider
├── EventRepository.js     # Base class with CRUD methods
├── index.js              # Initializes all repos on startup
├── user-event-repository.js
├── resource-event-repository.js
├── booking-event-repository.js
├── payment-event-repository.js
├── chat-event-repository.js
├── tour-event-repository.js
├── request-event-repository.js
├── favorite-event-repository.js
├── feedback-event-repository.js
├── demand-event-repository.js
├── payout-event-repository.js
└── analytics-event-repository.js
```

---

## How to Add a New Entity

### Step 1: Create Event Repository

```javascript
// src/event-sourcing/review-event-repository.js
const EventRepository = require('./EventRepository');

const initialState = {
  author: null,
  rating: 0,
  comment: ''
};

const fold = (evt, state) => {
  switch (evt.type) {
    case 'created':
      return { author: evt.author, rating: evt.rating, comment: evt.comment };
    default:
      return {};
  }
};

const eventHandlers = {
  created: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      author: evt.author,
      rating: evt.rating,
      comment: evt.comment
    });
  }
};

const commands = {
  create: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Already exists');
    return { type: 'created', ...cmd };
  }
};

let reviewEventRepo = null;

function createReviewEventRepo(readModelCollection) {
  if (reviewEventRepo) return reviewEventRepo;

  reviewEventRepo = new EventRepository(
    'review',           // aggregate name
    'review-events',   // stream name
    { initialState, fold, commands, eventHandlers },
    readModelCollection
  );

  reviewEventRepo._initEventSourcing();
  return reviewEventRepo;
}

module.exports = { createReviewEventRepo };
```

### Step 2: Register in index.js

```javascript
// src/event-sourcing/index.js
const { createReviewEventRepo } = require('./review-event-repository');

async function initAll() {
  // ... existing code ...

  const reviewsColl = db.collection('reviews');
  await createIndexSafe(reviewsColl, { author: 1 });

  repos = {
    // ... existing repos
    reviewEventRepo: createReviewEventRepo(reviewsColl),
  };
}
```

### Step 3: Use in Service

```javascript
// src/service/review-service.js
const { getRepos } = require('../event-sourcing');
const mongoose = require('mongoose');

async function createReview(data) {
  const repo = getRepos().reviewEventRepo;
  const reviewId = new mongoose.Types.ObjectId().toString();

  await repo.create({
    _id: reviewId,
    author: data.author,
    rating: data.rating,
    comment: data.comment
  });

  return await repo.findById(reviewId);
}

module.exports = { createReview };
```

---

## Quick Reference

| Term | Description |
|------|-------------|
| **Stream** | Collection of events for one entity type (e.g., "user-events") |
| **Aggregate** | The entity being tracked (user, booking, etc.) |
| **Command** | Function that creates events, contains business logic |
| **Event** | Immutable fact stored in events_store |
| **Fold** | Function that computes state from events |
| **Event Handler** | Updates read model when event occurs |
| **Read Model** | MongoDB collection for fast queries |

---

## Database Collections

### Event Store (evtstore manages)
| Collection | Purpose |
|------------|---------|
| `events_store` | All events from all aggregates |
| `events_bookmarks` | Handler positions |

### Read Models (your data)
| Collection | Entity |
|------------|--------|
| `users` | User accounts |
| `resources` | Properties/houses |
| `bookings` | Reservations |
| `payments` | Payments |
| `conversations` | Chat conversations |
| `messages` | Chat messages |
| `tours` | Property viewings |
| `requests` | Tenant requests |
| `favorites` | Saved properties |
| `feedbacks` | Reviews/feedback |
| `demands` | Demands |
| `payouts` | Host payouts |
| `analytics` | Usage stats |

---

## Benefits for This Project

1. **Full audit trail** - Every property listing, booking, payment is tracked
2. **Debugging** - Can replay events to see exact state changes
3. **Consistency** - No direct updates, always through events
4. **Scalability** - Event store handles high write volume