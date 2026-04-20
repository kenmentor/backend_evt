export type DemandEvt =
  | {
      type: 'demandCreated';
      guest: string;
      category: string;
      minPrice?: number;
      maxPrice?: number;
      location?: string;
      description?: string;
      performedBy?: string;
    }
  | {
      type: 'demandUpdated';
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      location?: string;
      description?: string;
      performedBy?: string;
    }
  | {
      type: 'demandDeleted';
      performedBy?: string;
    };

export type DemandAgg = {
  guest: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  description: string;
  deleted: boolean;
};

export type DemandCmd =
  | {
      type: 'create';
      guest: string;
      category: string;
      minPrice?: number;
      maxPrice?: number;
      location?: string;
      description?: string;
      performedBy?: string;
    }
  | {
      type: 'update';
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      location?: string;
      description?: string;
      performedBy?: string;
    }
  | {
      type: 'delete';
      performedBy?: string;
    };