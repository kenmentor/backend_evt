const mongoose = require("mongoose");

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

    // Option 2: store object
    responed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add indexes for fast queries
demandSchema.index({ location: "text", type: "text", category: "text" }); // Full-text search
module.exports = mongoose.model("Demand", demandSchema);
