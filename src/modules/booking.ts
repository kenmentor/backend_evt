import mongoose, { Document } from "mongoose";

export interface IBooking extends Document {
  host: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId;
  amount: number;
  house: mongoose.Types.ObjectId;
  status: string;
  paymentId: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  platformFee: number;
  expiredDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      require: true,
      default: 0.0,
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    status: {
      type: String,

      defualt: "pending",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    expiredDate: {
      type: Date,
      default: () => {
        const now = new Date();
        now.setDate(now.getDate() + 3);
        return now;
      },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ location: "text", type: "text", category: "text" });

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
export default Booking;
