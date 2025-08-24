const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Filterable fields
    state: { type: String, required: true }, // e.g. Rivers
    lga: { type: String, required: true }, // e.g. Obio-Akpor
    landmark: { type: String }, // e.g. Hwa
    address: { type: String, required: true },

    maxGuests: { type: Number, default: 1 },
    price: { type: Number, required: true },

    amenities: [
      {
        type: String,
        enum: [
          "Steady Power",
          "Water Supply",
          "Parking",
          "Security",
          "Furnished",
          "WiFi",
          "AC",
          "Laundry",
        ],
      },
    ],

    type: { type: String, required: true }, // e.g. Self-Contain, Flat, Duplex

    category: { type: String, required: true }, // For broader grouping
    location: { type: String, required: true }, // Could store coordinates or city

    electricity: { type: Number, required: true }, // 0–24hrs estimate
    waterSupply: { type: Boolean, required: true },

    views: { type: Number, default: 0 },

    thumbnail: String,
    gallery: [String],

    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast search/filtering
resourceSchema.index({
  state: 1,
  lga: 1,
  landmark: 1,
  type: 1,
  price: 1,
  amenities: 1,
});

module.exports = mongoose.model("Resource", resourceSchema);
