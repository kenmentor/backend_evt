import mongoose, { Document } from "mongoose";

export interface ITour extends Document {
  propertyId: mongoose.Types.ObjectId;
  propertyTitle: string;
  propertyThumbnail: string;
  propertyLocation: string;
  guestId: mongoose.Types.ObjectId;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  hostId: mongoose.Types.ObjectId;
  hostName: string;
  agentId: mongoose.Types.ObjectId | null;
  agentName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const tourSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    propertyThumbnail: {
      type: String,
      default: "",
    },
    propertyLocation: {
      type: String,
      default: "",
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      default: "",
    },
    guestPhone: {
      type: String,
      required: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostName: {
      type: String,
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    agentName: {
      type: String,
      default: "",
    },
    scheduledDate: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Tour = mongoose.model<ITour>("Tour", tourSchema);
export default Tour;
