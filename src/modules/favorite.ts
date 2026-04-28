import mongoose, { Document } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  houseId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index({ userId: 1, houseId: 1 }, { unique: true });

const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);
export default Favorite;
