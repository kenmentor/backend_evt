export type ResourceEvt =
  | {
      type: 'resourceCreated';
      host: string;
      title: string;
      description?: string;
      houseType?: string;
      category?: string;
      price?: string;
      address?: string;
      state?: string;
      lga?: string;
      location?: string;
      bedrooms?: number;
      bathrooms?: number;
      furnishing?: string;
      amenities?: string[];
      images?: Array<{ url: string; publicId: string }>;
      video?: string;
      thumbnail?: string;
      performedBy?: string;
    }
  | {
      type: 'resourceLocationUpdated';
      address?: string;
      state?: string;
      lga?: string;
      location?: string;
      performedBy?: string;
    }
  | {
      type: 'resourceDetailsUpdated';
      bedrooms?: number;
      bathrooms?: number;
      furnishing?: string;
      performedBy?: string;
    }
  | {
      type: 'resourceAmenitiesUpdated';
      amenities: string[];
      performedBy?: string;
    }
  | {
      type: 'resourceMediaAdded';
      images?: Array<{ url: string; publicId: string }>;
      video?: string;
      thumbnail?: string;
      performedBy?: string;
    }
  | {
      type: 'resourceMediaRemoved';
      imageUrls: string[];
      performedBy?: string;
    }
  | {
      type: 'resourcePriceUpdated';
      price: string;
      performedBy?: string;
    }
  | {
      type: 'resourceAvailabilityChanged';
      avaliable: boolean;
      performedBy?: string;
    }
  | {
      type: 'resourceViewed';
      performedBy?: string;
    }
  | {
      type: 'resourceDeleted';
      performedBy?: string;
    };

export type ResourceAgg = {
  host: string;
  title: string;
  description: string;
  houseType: string;
  category: string;
  price: string;
  address: string;
  state: string;
  lga: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  furnishing: string;
  amenities: string[];
  images: Array<{ url: string; publicId: string }>;
  video: string;
  thumbnail: string;
  views: number;
  avaliable: boolean;
  deleted: boolean;
};

export type ResourceCmd =
  | {
      type: 'create';
      host: string;
      title: string;
      description?: string;
      houseType?: string;
      category?: string;
      price?: string;
      address?: string;
      state?: string;
      lga?: string;
      location?: string;
      bedrooms?: number;
      bathrooms?: number;
      furnishing?: string;
      amenities?: string[];
      images?: Array<{ url: string; publicId: string }>;
      video?: string;
      thumbnail?: string;
      performedBy?: string;
    }
  | {
      type: 'updateLocation';
      address?: string;
      state?: string;
      lga?: string;
      location?: string;
      performedBy?: string;
    }
  | {
      type: 'updateDetails';
      bedrooms?: number;
      bathrooms?: number;
      furnishing?: string;
      performedBy?: string;
    }
  | {
      type: 'updateAmenities';
      amenities: string[];
      performedBy?: string;
    }
  | {
      type: 'addMedia';
      images?: Array<{ url: string; publicId: string }>;
      video?: string;
      thumbnail?: string;
      performedBy?: string;
    }
  | {
      type: 'removeMedia';
      imageUrls: string[];
      performedBy?: string;
    }
  | {
      type: 'updatePrice';
      price: string;
      performedBy?: string;
    }
  | {
      type: 'setAvailability';
      avaliable: boolean;
      performedBy?: string;
    }
  | {
      type: 'recordView';
      performedBy?: string;
    }
  | {
      type: 'delete';
      performedBy?: string;
    };