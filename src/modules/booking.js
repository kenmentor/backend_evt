const mongoose = require("mongoose");

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
        now.setDate(now.getDate() + 3); // adds 3 days
        return now;
      },
    },
  },
  { timestamps: true }
);

// Add indexes for fast queries
bookingSchema.index({ location: "text", type: "text", category: "text" }); // Full-text search
module.exports = mongoose.model("Booking", bookingSchema);
