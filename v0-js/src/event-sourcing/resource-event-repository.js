/**
 * Resource Event Repository - MongoDB Version (Updated)
 * 
 * Event naming: resourceCreated, resourceLocationUpdated, etc. (aggregate prefix + past tense)
 */

const EventRepository = require('./EventRepository');

const initialState = {
  host: null, title: '', description: '', type: '', category: '', price: '',
  address: '', state: '', lga: '', location: '',
  bedrooms: 1, bathrooms: 1, furnishing: '', amenities: [], images: [],
  video: null, thumbnail: null, views: 0, avaliable: true, deleted: false,
};

const fold = (evt, state) => {
  switch (evt.type) {
    case 'resourceCreated':
      return { host: evt.host, title: evt.title, description: evt.description, type: evt.houseType, category: evt.category, price: evt.price, address: evt.address, state: evt.state, lga: evt.lga, location: evt.location, bedrooms: evt.bedrooms, bathrooms: evt.bathrooms, furnishing: evt.furnishing, amenities: evt.amenities, images: evt.images, video: evt.video, thumbnail: evt.thumbnail };
    case 'resourceLocationUpdated':
      return { address: evt.address, state: evt.state, lga: evt.lga, location: evt.location };
    case 'resourceDetailsUpdated':
      return { bedrooms: evt.bedrooms, bathrooms: evt.bathrooms, furnishing: evt.furnishing };
    case 'resourceAmenitiesUpdated':
      return { amenities: evt.amenities };
    case 'resourceMediaAdded':
      return { images: [...state.images, ...evt.images], video: evt.video, thumbnail: evt.thumbnail };
    case 'resourceMediaRemoved':
      return { images: state.images.filter(img => !evt.imageUrls.includes(img.url)) };
    case 'resourcePriceUpdated':
      return { price: evt.price };
    case 'resourceAvailabilityChanged':
      return { avaliable: evt.avaliable };
    case 'resourceViewed':
      return { views: state.views + 1 };
    case 'resourceDeleted':
      return { avaliable: false, deleted: true };
    default:
      return {};
  }
};

const eventHandlers = {
  resourceCreated: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      host: evt.host, title: evt.title, description: evt.description || '', type: evt.houseType || '', category: evt.category || '', price: evt.price || '',
      address: evt.address || '', state: evt.state || '', lga: evt.lga || '', location: evt.location || '',
      bedrooms: evt.bedrooms || 1, bathrooms: evt.bathrooms || 1, furnishing: evt.furnishing || '', amenities: evt.amenities || [], images: evt.images || [], video: evt.video || '', thumbnail: evt.thumbnail || '',
      views: 0, avaliable: true, deleted: false,
    });
  },
  resourceLocationUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { address: evt.address, state: evt.state, lga: evt.lga, location: evt.location }),
  resourceDetailsUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { bedrooms: evt.bedrooms, bathrooms: evt.bathrooms, furnishing: evt.furnishing }),
  resourceAmenitiesUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { amenities: evt.amenities }),
  resourceMediaAdded: async (id, evt, repo) => {
    const existing = await repo.findById(id);
    const currentImages = existing ? existing.images : [];
    await repo._updateInReadModel(id, { images: [...currentImages, ...evt.images], video: evt.video, thumbnail: evt.thumbnail });
  },
  resourceMediaRemoved: async (id, evt, repo) => {
    const existing = await repo.findById(id);
    if (existing) {
      await repo._updateInReadModel(id, { images: existing.images.filter(img => !evt.imageUrls.includes(img.url)) });
    }
  },
  resourcePriceUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { price: evt.price }),
  resourceAvailabilityChanged: async (id, evt, repo) => repo._updateInReadModel(id, { avaliable: evt.avaliable }),
  resourceViewed: async (id, _, repo) => {
    const existing = await repo.findById(id);
    if (existing) await repo._updateInReadModel(id, { views: existing.views + 1 });
  },
  resourceDeleted: async (id, _, repo) => repo._updateInReadModel(id, { avaliable: false, deleted: true }),
};

const commands = {
  create: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Resource already exists');
    return { type: 'resourceCreated', host: cmd.host, title: cmd.title, description: cmd.description, houseType: cmd.type, category: cmd.category, price: cmd.price, address: cmd.address, state: cmd.state, lga: cmd.lga, location: cmd.location, bedrooms: cmd.bedrooms, bathrooms: cmd.bathrooms, furnishing: cmd.furnishing, amenities: cmd.amenities, images: cmd.images, video: cmd.video, thumbnail: cmd.thumbnail };
  },
  updateLocation: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'resourceLocationUpdated', address: cmd.address, state: cmd.state, lga: cmd.lga, location: cmd.location };
  },
  updateDetails: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'resourceDetailsUpdated', bedrooms: cmd.bedrooms, bathrooms: cmd.bathrooms, furnishing: cmd.furnishing };
  },
  updateAmenities: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    if (JSON.stringify(agg.amenities) === JSON.stringify(cmd.amenities)) return;
    return { type: 'resourceAmenitiesUpdated', amenities: cmd.amenities };
  },
  addMedia: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'resourceMediaAdded', images: cmd.images, video: cmd.video, thumbnail: cmd.thumbnail };
  },
  removeMedia: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'resourceMediaRemoved', imageUrls: cmd.imageUrls };
  },
  updatePrice: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.price === cmd.price) return;
    return { type: 'resourcePriceUpdated', price: cmd.price };
  },
  setAvailability: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.avaliable === cmd.avaliable) return;
    return { type: 'resourceAvailabilityChanged', avaliable: cmd.avaliable };
  },
  recordView: async (_, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'resourceViewed' };
  },
  delete: async (_, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'resourceDeleted' };
  },
};

let resourceEventRepo = null;

function createResourceEventRepo(readModelCollection) {
  if (resourceEventRepo) return resourceEventRepo;
  
  resourceEventRepo = new EventRepository('resource', 'resource-events', {
    initialState,
    fold,
    commands,
    eventHandlers,
  }, readModelCollection);

  resourceEventRepo._initEventSourcing();
  return resourceEventRepo;
}

module.exports = { createResourceEventRepo };