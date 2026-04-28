const mongoose = require("mongoose");

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

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
