const mongoose = require("mongoose");

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
    amount: {
      type: Number,
      require: true,
      default: 0.0,
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
  },

  { timestamps: true }
);

// Add indexes for fast queries
paymentSchema.index({ location: "text", type: "text", category: "text" }); // Full-text search
module.exports = mongoose.model("Payment", paymentSchema);
