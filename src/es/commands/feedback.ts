import { createCommands } from 'evtstore';
import type { FeedbackEvt, FeedbackAgg, FeedbackCmd } from '../types/feedback';
import { domain } from '../domain';

export const feedbackCmd = createCommands<FeedbackEvt, FeedbackAgg, FeedbackCmd>(domain.feedbacks, {
  async create(cmd, agg) {
    if (agg.version > 0) throw new Error('Feedback already exists');
    return {
      type: 'feedbackCreated',
      userId: cmd.userId,
      houseId: cmd.houseId,
      rating: cmd.rating,
      comment: cmd.comment,
      performedBy: cmd.performedBy,
    };
  },

  async update(cmd, agg) {
    if (agg.version === 0) throw new Error('Feedback not found');
    if (agg.deleted) throw new Error('Feedback is deleted');
    return {
      type: 'feedbackUpdated',
      rating: cmd.rating,
      comment: cmd.comment,
      performedBy: cmd.performedBy,
    };
  },

  async delete(cmd, agg) {
    if (agg.version === 0) throw new Error('Feedback not found');
    if (agg.deleted) throw new Error('Feedback already deleted');
    return {
      type: 'feedbackDeleted',
      performedBy: cmd.performedBy,
    };
  },
});