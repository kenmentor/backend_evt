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

    // Property Details
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    area: { type: Number, default: 0 },
    furnishing: { type: String, default: "" },
    floor: { type: Number, default: 1 },
    totalFloors: { type: String, default: "" },
    age: { type: Number, default: 0 },
    waterSuply: { type: Boolean, default: true },
    electricity: { type: Number, default: 0 },

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

    // Contact
    contactPreference: {
      type: String,
      enum: ["phone", "email", "both"],
      default: "both",
    },
    availableFrom: { type: String, default: "" },

    // Other
    views: { type: Number, default: 0 },
    avaliable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Full-text search index
resourceSchema.index({ location: "text", type: "text", category: "text" });

module.exports = mongoose.model("Resource", resourceSchema);
