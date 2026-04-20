export type FavoriteEvt =
  | {
      type: 'favoriteAdded';
      userId: string;
      houseId: string;
      performedBy?: string;
    }
  | {
      type: 'favoriteRemoved';
      performedBy?: string;
    };

export type FavoriteAgg = {
  userId: string;
  houseId: string;
};

export type FavoriteCmd =
  | {
      type: 'add';
      userId: string;
      houseId: string;
      performedBy?: string;
    }
  | {
      type: 'remove';
      performedBy?: string;
    };