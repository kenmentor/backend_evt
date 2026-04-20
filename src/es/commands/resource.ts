import { createCommands } from 'evtstore';
import type { ResourceEvt, ResourceAgg, ResourceCmd } from '../types/resource';
import { domain } from '../domain';

export const resourceCmd = createCommands<ResourceEvt, ResourceAgg, ResourceCmd>(domain.resources, {
  async create(cmd, agg) {
    if (agg.version > 0) throw new Error('Resource already exists');
    return {
      type: 'resourceCreated',
      host: cmd.host,
      title: cmd.title,
      description: cmd.description,
      houseType: cmd.houseType,
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
      performedBy: cmd.performedBy,
    };
  },

  async updateLocation(cmd, agg) {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.deleted) throw new Error('Resource is deleted');
    return {
      type: 'resourceLocationUpdated',
      address: cmd.address,
      state: cmd.state,
      lga: cmd.lga,
      location: cmd.location,
      performedBy: cmd.performedBy,
    };
  },

  async updateDetails(cmd, agg) {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.deleted) throw new Error('Resource is deleted');
    return {
      type: 'resourceDetailsUpdated',
      bedrooms: cmd.bedrooms,
      bathrooms: cmd.bathrooms,
      furnishing: cmd.furnishing,
      performedBy: cmd.performedBy,
    };
  },

  async updateAmenities(cmd, agg) {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.deleted) throw new Error('Resource is deleted');
    return {
      type: 'resourceAmenitiesUpdated',
      amenities: cmd.amenities,
      performedBy: cmd.performedBy,
    };
  },

  async addMedia(cmd, agg) {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.deleted) throw new Error('Resource is deleted');
    return {
      type: 'resourceMediaAdded',
      images: cmd.images,
      video: cmd.video,
      thumbnail: cmd.thumbnail,
      performedBy: cmd.performedBy,
    };
  },

  async removeMedia(cmd, agg) {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.deleted) throw new Error('Resource is deleted');
    return {
      type: 'resourceMediaRemoved',
      imageUrls: cmd.imageUrls,
      performedBy: cmd.performedBy,
    };
  },

  async updatePrice(cmd, agg) {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.deleted) throw new Error('Resource is deleted');
    if (agg.price === cmd.price) return;
    return {
      type: 'resourcePriceUpdated',
      price: cmd.price,
      performedBy: cmd.performedBy,
    };
  },

  async setAvailability(cmd, agg) {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.deleted) throw new Error('Resource is deleted');
    if (agg.avaliable === cmd.avaliable) return;
    return {
      type: 'resourceAvailabilityChanged',
      avaliable: cmd.avaliable,
      performedBy: cmd.performedBy,
    };
  },

  async recordView(cmd, agg) {
    if (agg.version === 0) throw new Error('Resource not found');
    return {
      type: 'resourceViewed',
      performedBy: cmd.performedBy,
    };
  },

  async delete(cmd, agg) {
    if (agg.version === 0) throw new Error('Resource not found');
    if (agg.deleted) throw new Error('Resource already deleted');
    return {
      type: 'resourceDeleted',
      performedBy: cmd.performedBy,
    };
  },
});