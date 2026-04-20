import { createAggregate } from 'evtstore';
import type { ResourceEvt, ResourceAgg } from '../types/resource';

export const resourceAgg = createAggregate<ResourceEvt, ResourceAgg, 'resources'>({
  stream: 'resources',
  create: (): ResourceAgg => ({
    host: '',
    title: '',
    description: '',
    houseType: '',
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
    video: '',
    thumbnail: '',
    views: 0,
    avaliable: true,
    deleted: false,
  }),
  fold: (evt, prev): ResourceAgg => {
    switch (evt.type) {
      case 'resourceCreated':
        return {
          ...prev,
          host: evt.host,
          title: evt.title,
          description: evt.description || '',
          houseType: evt.houseType || '',
          category: evt.category || '',
          price: evt.price || '',
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
          deleted: false,
        };

      case 'resourceLocationUpdated':
        return {
          ...prev,
          address: evt.address ?? prev.address,
          state: evt.state ?? prev.state,
          lga: evt.lga ?? prev.lga,
          location: evt.location ?? prev.location,
        };

      case 'resourceDetailsUpdated':
        return {
          ...prev,
          bedrooms: evt.bedrooms ?? prev.bedrooms,
          bathrooms: evt.bathrooms ?? prev.bathrooms,
          furnishing: evt.furnishing ?? prev.furnishing,
        };

      case 'resourceAmenitiesUpdated':
        return {
          ...prev,
          amenities: evt.amenities,
        };

      case 'resourceMediaAdded':
        return {
          ...prev,
          images: [...prev.images, ...(evt.images || [])],
          video: evt.video ?? prev.video,
          thumbnail: evt.thumbnail ?? prev.thumbnail,
        };

      case 'resourceMediaRemoved':
        return {
          ...prev,
          images: prev.images.filter(img => !evt.imageUrls.includes(img.url)),
        };

      case 'resourcePriceUpdated':
        return {
          ...prev,
          price: evt.price,
        };

      case 'resourceAvailabilityChanged':
        return {
          ...prev,
          avaliable: evt.avaliable,
        };

      case 'resourceViewed':
        return {
          ...prev,
          views: prev.views + 1,
        };

      case 'resourceDeleted':
        return {
          ...prev,
          avaliable: false,
          deleted: true,
        };

      default:
        return prev;
    }
  },
});