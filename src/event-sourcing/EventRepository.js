/**
 * EventRepository Base Class - MongoDB Version
 * 
 * Production-ready event sourcing with MongoDB.
 * 
 * Architecture:
 * - Events → Event Store (append-only, fast writes)
 * - Event Handlers → Read Models (MongoDB collections)
 * 
 * Scaling Strategy:
 * - Event store is append-only (no locks, very fast)
 * - Read models updated asynchronously via handlers
 * - Multiple handlers can process same events for different views
 * - Aggregate state computed on-demand from events
 */

const mongoose = require('mongoose');
const evtstore = require('evtstore');
const { getProvider } = require('./mongo-connection');

class EventRepository {
  constructor(aggregateName, streamName, schema, readModelCollection = null) {
    this.aggregateName = aggregateName;
    this.streamName = streamName;
    this.schema = schema;
    this.readModelCollection = readModelCollection;
    
    // Cache for in-memory aggregate state during requests
    this.aggregateCache = new Map();
  }

  _initEventSourcing() {
    const aggregateConfig = {
      stream: this.streamName,
      create: () => ({ ...this.schema.initialState }),
      fold: this.schema.fold,
    };

    if (this.schema.version && this.schema.persistAggregate) {
      aggregateConfig.version = this.schema.version;
      aggregateConfig.persistAggregate = true;
    }

    this.storableAggregate = evtstore.createAggregate(aggregateConfig);

    const provider = getProvider();

    const { domain, createHandler } = evtstore.createDomainV2(
      { provider },
      { [this.aggregateName]: this.storableAggregate }
    );

    this.domain = domain;
    this.createHandler = createHandler;

    if (this.schema.commands) {
      this.commands = evtstore.createCommands(
        this.domain[this.aggregateName],
        this.schema.commands
      );
    }

    this._initEventHandler();
  }

  _initEventHandler() {
    this.handler = this.createHandler(`${this.aggregateName}-handler`, [this.streamName], {
      tailStream: false,
      continueOnError: true,
    });

    if (this.schema.eventHandlers) {
      for (const [eventType, handlerFn] of Object.entries(this.schema.eventHandlers)) {
        this.handler.handle(this.streamName, eventType, async (id, evt, meta) => {
          try {
            await handlerFn(id, evt, this, meta);
          } catch (error) {
            console.error(`Handler error for ${eventType}:`, error);
          }
        });
      }
    }

    this.handler.start();
  }

  // ==================== CRUD INTERFACE ====================

  async find(query = {}) {
    if (!this.readModelCollection) {
      throw new Error('Read model collection not configured');
    }
    return this.readModelCollection.find(query).toArray();
  }

  async findOne(query = {}) {
    if (!this.readModelCollection) {
      throw new Error('Read model collection not configured');
    }
    return this.readModelCollection.findOne(query);
  }

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID is not valid');
    }
    if (!this.readModelCollection) {
      throw new Error('Read model collection not configured');
    }
    return this.readModelCollection.findOne({ _id: id });
  }

  async create(data) {
    if (!this.commands) {
      throw new Error('Commands not implemented');
    }

    const id = data._id || new mongoose.Types.ObjectId().toString();
    const { _id, ...createData } = data;

    console.log(`[${this.aggregateName}] Creating with data:`, JSON.stringify(createData));

    const createCommand =
      this.commands.create ||
      this.commands.register ||
      this.commands.add ||
      this.commands.insert;

    if (!createCommand) {
      throw new Error('Create command not implemented');
    }

    await createCommand(id, createData);
    await this.handler.runOnce();

    return this.findById(id);
  }

  async update(key, data) {
    if (!this.commands) {
      throw new Error('Commands not implemented');
    }

    const updateCommand =
      this.commands.update ||
      this.commands.modify ||
      this.commands.edit;

    if (!updateCommand) {
      throw new Error('Update command not implemented');
    }

    await updateCommand(key, data);
    await this.handler.runOnce();

    return this.findById(key);
  }

  async delete(id) {
    if (!this.commands) {
      throw new Error('Commands not implemented');
    }

    const deleteCommand =
      this.commands.delete ||
      this.commands.remove ||
      this.commands.destroy;

    if (!deleteCommand) {
      throw new Error('Delete command not implemented');
    }

    await deleteCommand(id, {});
    await this.handler.runOnce();

    return this.findById(id);
  }

  async findAll() {
    if (!this.readModelCollection) {
      throw new Error('Read model collection not configured');
    }
    return this.readModelCollection.find({}).toArray();
  }

  async findOneAndUpdate(query, data) {
    const item = await this.findOne(query);
    if (!item) return null;
    return this.update(item._id, data);
  }

  // ==================== EVENT SOURCING HELPERS ====================

  async getAggregate(id) {
    return this.domain[this.aggregateName].getAggregate(id);
  }

  // ==================== READ MODEL HELPERS ====================

  async _addToReadModel(id, data) {
    if (!this.readModelCollection) return;
    await this.readModelCollection.updateOne(
      { _id: id },
      {
        $set: { ...data, updatedAt: new Date() },
        $setOnInsert: { _id: id, createdAt: new Date() },
      },
      { upsert: true }
    );
  }

  async _updateInReadModel(id, data) {
    if (!this.readModelCollection) return;
    await this.readModelCollection.updateOne(
      { _id: id },
      { $set: { ...data, updatedAt: new Date() } }
    );
  }

  async _upsertInReadModel(id, data) {
    if (!this.readModelCollection) return;
    await this.readModelCollection.updateOne(
      { _id: id },
      {
        $set: { ...data, updatedAt: new Date() },
        $setOnInsert: { _id: id, createdAt: new Date() },
      },
      { upsert: true }
    );
  }

  async _removeFromReadModel(id) {
    if (!this.readModelCollection) return;
    await this.readModelCollection.deleteOne({ _id: id });
  }

  // ==================== AGGREGATE CACHE ====================

  getCachedAggregate(id) {
    return this.aggregateCache.get(id);
  }

  setCachedAggregate(id, aggregate, ttl = 5000) {
    this.aggregateCache.set(id, aggregate);
    setTimeout(() => this.aggregateCache.delete(id), ttl);
  }

  clearCache(id = null) {
    if (id) {
      this.aggregateCache.delete(id);
    } else {
      this.aggregateCache.clear();
    }
  }
}

module.exports = EventRepository;
