const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paidDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payout = mongoose.model("Payout", payoutSchema);

module.exports = Payout;
