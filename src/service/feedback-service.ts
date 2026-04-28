import mongoose from "mongoose";
import { feedbackCmd } from "../es/commands/feedback";
import { queryFeedbacks } from "../es/queries";
import { projectionHandlers } from "../es/projection";

export async function create_feedback(feedbackObj: any) {
  const feedbackId = new mongoose.Types.ObjectId().toString();

  await feedbackCmd.create(feedbackId, {
    userId: feedbackObj.userId,
    houseId: feedbackObj.houseId || '',
    rating: feedbackObj.rating || 0,
    comment: feedbackObj.message || feedbackObj.comment || '',
  });

  await projectionHandlers.feedbacks.runOnce();
  return await queryFeedbacks.getByAggregateId(feedbackId);
}

export async function get_feedback() {
  return await queryFeedbacks.getAll();
}
