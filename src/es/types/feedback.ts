export type FeedbackEvt =
  | {
      type: 'feedbackCreated';
      userId: string;
      houseId: string;
      rating: number;
      comment: string;
      performedBy?: string;
    }
  | {
      type: 'feedbackUpdated';
      rating?: number;
      comment?: string;
      performedBy?: string;
    }
  | {
      type: 'feedbackDeleted';
      performedBy?: string;
    };

export type FeedbackAgg = {
  userId: string;
  houseId: string;
  rating: number;
  comment: string;
  deleted: boolean;
};

export type FeedbackCmd =
  | {
      type: 'create';
      userId: string;
      houseId: string;
      rating: number;
      comment: string;
      performedBy?: string;
    }
  | {
      type: 'update';
      rating?: number;
      comment?: string;
      performedBy?: string;
    }
  | {
      type: 'delete';
      performedBy?: string;
    };