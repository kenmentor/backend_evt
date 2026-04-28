const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Basic Info
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true }, // frontend sends string, not number

    // Location

    address: { type: String, required: true },
    state: { type: String, required: true },
    lga: { type: String, default: "" },
    location: { type: String, default: "" },

    // Property Details
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },

    furnishing: { type: String, default: "" },

    // Amenities
    amenities: [{ type: String, default: [] }],

    // Media
    images: [
      {
        url: { type: String, required: true },
        type: { type: String, default: "image/png" },
      },
    ],
    video: { type: String, default: null },
    thumbnail: { type: String, default: null },

    // Other
    views: { type: Number, default: 0 },
    avaliable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Comprehensive full-text search index with weights
// Higher weight = higher relevance in results
resourceSchema.index(
  {
    title: "text",
    description: "text",
    address: "text",
    location: "text",
    type: "text",
    category: "text",
    amenities: "text",
  },
  {
    weights: {
      title: 10,
      address: 7,
      location: 5,
      type: 3,
      category: 2,
      amenities: 1,
      description: 1,
    },
    name: "propertySearchIndex",
  }
);

// Compound indexes for common filter combinations
resourceSchema.index({ avaliable: 1, state: 1, type: 1 });
resourceSchema.index({ avaliable: 1, price: 1 });
resourceSchema.index({ avaliable: 1, category: 1 });
resourceSchema.index({ host: 1, avaliable: 1 });
resourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Resource", resourceSchema);
