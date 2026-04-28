import mongoose, { Document } from "mongoose";

export interface IDemand extends Document {
  guest: mongoose.Types.ObjectId;
  description: string;
  state?: string;
  price: number;
  type?: string;
  category: string;
  responed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const demandSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: { type: String, required: true },
    state: { type: String },

    price: { type: Number, required: true },

    type: { type: String },

    category: { type: String, required: true },

    responed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

demandSchema.index({ location: "text", type: "text", category: "text" });

const Demand = mongoose.model<IDemand>("Demand", demandSchema);
export default Demand;
