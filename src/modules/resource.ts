import mongoose, { Document } from "mongoose";

export interface IResource extends Document {
  host: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: string;
  category: string;
  price: string;
  address: string;
  state: string;
  lga: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  furnishing: string;
  amenities: string[];
  images: { url: string; type: string }[];
  video: string | null;
  thumbnail: string | null;
  views: number;
  avaliable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true },

    address: { type: String, required: true },
    state: { type: String, required: true },
    lga: { type: String, default: "" },
    location: { type: String, default: "" },

    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },

    furnishing: { type: String, default: "" },

    amenities: [{ type: String, default: [] }],

    images: [
      {
        url: { type: String, required: true },
        type: { type: String, default: "image/png" },
      },
    ],
    video: { type: String, default: null },
    thumbnail: { type: String, default: null },

    views: { type: Number, default: 0 },
    avaliable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

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

resourceSchema.index({ avaliable: 1, state: 1, type: 1 });
resourceSchema.index({ avaliable: 1, price: 1 });
resourceSchema.index({ avaliable: 1, category: 1 });
resourceSchema.index({ host: 1, avaliable: 1 });
resourceSchema.index({ createdAt: -1 });

const Resource = mongoose.model<IResource>("Resource", resourceSchema);
export default Resource;
