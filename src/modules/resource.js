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
    price: { type: Number, required: true },

    // Location
    location: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    lga: { type: String },

    // Property Details
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    area: { type: Number }, // could be in sq ft or sq m
    furnishing: { type: String }, // e.g., "Furnished", "Unfurnished"
    floor: { type: Number },
    totalFloors: { type: Number },
    age: { type: Number }, // property age in years
    waterSuply: { type: Boolean, default: true },
    electricity: { type: Number, default: 0 },

    // Amenities
    amenities: [{ type: String }],

    // Media
    images: [{ type: String }], // store file URLs or S3 paths
    video: { type: String }, // URL or path
    thumbnail: { type: String }, // URL or path

    // Contact
    contactPreference: {
      type: String,
      enum: ["phone", "email", "both"],
      default: "both",
    },
    availableFrom: { type: Date },

    // Other
    views: { type: Number, default: 0 },
    avaliable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Add indexes for fast queries
resourceSchema.index({ location: "text", type: "text", category: "text" }); // Full-text search

module.exports = mongoose.model("Resource", resourceSchema);
