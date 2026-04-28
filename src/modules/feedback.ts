import mongoose, { Document } from "mongoose";

export interface IFeedback extends Document {
  userId?: mongoose.Types.ObjectId;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedback = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: { type: String },
  },
  { timestamps: true }
);

const Feedback = mongoose.model<IFeedback>("feedback", feedback);
export default Feedback;
