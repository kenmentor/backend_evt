/**
 * Resource Event Repository - MongoDB Version
 */

const EventRepository = require('./EventRepository');

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

const fold = (evt, state) => {
  switch (evt.type) {
    case 'created':
      return {
        host: evt.host,
        title: evt.title,
        description: evt.description,
        type: evt.houseType,
        category: evt.category,
        price: evt.price,
        address: evt.address,
        state: evt.state,
        lga: evt.lga,
        location: evt.location,
        bedrooms: evt.bedrooms,
        bathrooms: evt.bathrooms,
        furnishing: evt.furnishing,
        amenities: evt.amenities,
        images: evt.images,
        video: evt.video,
        thumbnail: evt.thumbnail,
      };
    case 'locationUpdated':
      return { address: evt.address, state: evt.state, lga: evt.lga, location: evt.location };
    case 'detailsUpdated':
      return { bedrooms: evt.bedrooms, bathrooms: evt.bathrooms, furnishing: evt.furnishing };
    case 'amenitiesUpdated':
      return { amenities: evt.amenities };
    case 'mediaAdded':
      return { images: [...state.images, ...evt.images], video: evt.video, thumbnail: evt.thumbnail };
    case 'mediaRemoved':
      return { images: state.images.filter(img => !evt.imageUrls.includes(img.url)) };
    case 'priceUpdated':
      return { price: evt.price };
    case 'availabilityChanged':
      return { avaliable: evt.avaliable };
    case 'viewed':
      return { views: state.views + 1 };
    case 'deleted':
      return { avaliable: false };
    default:
      return {};
  }
};

const eventHandlers = {
  created: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      host: evt.host,
      title: evt.title,
      description: evt.description,
      type: evt.houseType || '',
      category: evt.category,
      price: evt.price,
      address: evt.address || '',
      state: evt.state || '',
      lga: evt.lga || '',
      location: evt.location || '',
      bedrooms: evt.bedrooms || 1,
      bathrooms: evt.bathrooms || 1,
      furnishing: evt.furnishing || '',
      amenities: evt.amenities || [],
      images: evt.images || [],
      video: evt.video || '',
      thumbnail: evt.thumbnail || '',
      views: 0,
      avaliable: true,
    });
  },
  locationUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { address: evt.address, state: evt.state, lga: evt.lga, location: evt.location }),
  detailsUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { bedrooms: evt.bedrooms, bathrooms: evt.bathrooms, furnishing: evt.furnishing }),
  amenitiesUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { amenities: evt.amenities }),
  mediaAdded: async (id, evt, repo) => {
    const existing = await repo.findById(id);
    const currentImages = existing ? existing.images : [];
    await repo._updateInReadModel(id, { images: [...currentImages, ...evt.images], video: evt.video, thumbnail: evt.thumbnail });
  },
  mediaRemoved: async (id, evt, repo) => {
    const existing = await repo.findById(id);
    if (existing) {
      await repo._updateInReadModel(id, { images: existing.images.filter(img => !evt.imageUrls.includes(img.url)) });
    }
  },
  priceUpdated: async (id, evt, repo) => repo._updateInReadModel(id, { price: evt.price }),
  availabilityChanged: async (id, evt, repo) => repo._updateInReadModel(id, { avaliable: evt.avaliable }),
  viewed: async (id, _, repo) => {
    const existing = await repo.findById(id);
    if (existing) await repo._updateInReadModel(id, { views: existing.views + 1 });
  },
  deleted: async (id, _, repo) => repo._updateInReadModel(id, { avaliable: false }),
};

const commands = {
  create: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Resource already exists');
    return {
      type: 'created',
      host: cmd.host,
      title: cmd.title,
      description: cmd.description,
      houseType: cmd.type,
      category: cmd.category,
      price: cmd.price,
      address: cmd.address,
      state: cmd.state,
      lga: cmd.lga,
      location: cmd.location,
      bedrooms: cmd.bedrooms,
      bathrooms: cmd.bathrooms,
      furnishing: cmd.furnishing,
      amenities: cmd.amenities,
      images: cmd.images,
      video: cmd.video,
      thumbnail: cmd.thumbnail,
    };
  },
  updateLocation: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'locationUpdated', address: cmd.address, state: cmd.state, lga: cmd.lga, location: cmd.location };
  },
  updateDetails: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'detailsUpdated', bedrooms: cmd.bedrooms, bathrooms: cmd.bathrooms, furnishing: cmd.furnishing };
  },
  updateAmenities: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    if (JSON.stringify(agg.amenities) === JSON.stringify(cmd.amenities)) return;
    return { type: 'amenitiesUpdated', amenities: cmd.amenities };
  },
  addMedia: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'mediaAdded', images: cmd.images, video: cmd.video, thumbnail: cmd.thumbnail };
  },
  removeMedia: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'mediaRemoved', imageUrls: cmd.imageUrls };
  },
  updatePrice: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.price === cmd.price) return;
    return { type: 'priceUpdated', price: cmd.price };
  },
  setAvailability: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.avaliable === cmd.avaliable) return;
    return { type: 'availabilityChanged', avaliable: cmd.avaliable };
  },
  recordView: async (_, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'viewed' };
  },
  delete: async (_, agg) => {
    if (agg.version === 0) throw new Error('Resource not found');
    return { type: 'deleted' };
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
