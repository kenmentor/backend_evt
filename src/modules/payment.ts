import mongoose, { Document } from "mongoose";

export interface IPayment extends Document {
  host: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId;
  house: mongoose.Types.ObjectId;
  note?: string;
  amount: number;
  method?: string;
  refund: number;
  status: string;
  paymentStatus: string;
  paymentRef: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new mongoose.Schema(
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
    note: { type: String },
    amount: {
      type: Number,
      require: true,
      default: 0.0,
    },
    method: {
      type: String,
    },
    refund: {
      type: Number,
      default: 0.0,
    },
    status: {
      type: String,
      required: true,
      defualt: "pending",
    },

    paymentStatus: {
      type: String,
      default: "pending",
      required: true,
    },

    paymentRef: {
      type: String,
      required: true,
    },
  },

  { timestamps: true }
);

paymentSchema.index({ location: "text", type: "text", category: "text" });

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
export default Payment;
