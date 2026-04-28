import mongoose, { Document } from "mongoose";

export interface IRequest extends Document {
  host: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId;
  house: mongoose.Types.ObjectId;
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

requestSchema.index({ location: "text", type: "text", category: "text" });

const Request = mongoose.model<IRequest>("Request", requestSchema);
export default Request;
