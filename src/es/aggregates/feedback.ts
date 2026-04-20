import { createAggregate } from 'evtstore';
import type { FeedbackEvt, FeedbackAgg } from '../types/feedback';

export const feedbackAgg = createAggregate<FeedbackEvt, FeedbackAgg, 'feedbacks'>({
  stream: 'feedbacks',
  create: (): FeedbackAgg => ({
    userId: '',
    houseId: '',
    rating: 0,
    comment: '',
    deleted: false,
  }),
  fold: (evt, prev): FeedbackAgg => {
    switch (evt.type) {
      case 'feedbackCreated':
        return {
          ...prev,
          userId: evt.userId,
          houseId: evt.houseId,
          rating: evt.rating,
          comment: evt.comment,
          deleted: false,
        };

      case 'feedbackUpdated':
        return {
          ...prev,
          rating: evt.rating ?? prev.rating,
          comment: evt.comment ?? prev.comment,
        };

      case 'feedbackDeleted':
        return {
          ...prev,
          deleted: true,
        };

      default:
        return prev;
    }
  },
});