const mongoose = require("mongoose");
const Favorite = require("../modules/favorite");
const House = require("../modules/resource");

class FavoriteRepository {
  async create(favoriteData) {
    const favorite = new Favorite(favoriteData);
    return await favorite.save();
  }

  async findByUserId(userId) {
    const favorites = await Favorite.find({ userId })
      .populate({
        path: "houseId",
        select: "title thumbnail price location bedrooms bathrooms status verified",
      })
      .sort({ createdAt: -1 });

    return favorites
      .filter((fav) => fav.houseId !== null)
      .map((fav) => fav.houseId);
  }

  async findByUserAndHouse(userId, houseId) {
    let houseObjectId = houseId;
    if (!mongoose.Types.ObjectId.isValid(houseId)) {
      const house = await House.findOne({ _id: houseId });
      if (house) {
        houseObjectId = house._id;
      } else {
        return null;
      }
    }
    return await Favorite.findOne({ userId, houseId: houseObjectId });
  }

  async delete(userId, houseId) {
    let houseObjectId = houseId;
    if (!mongoose.Types.ObjectId.isValid(houseId)) {
      const house = await House.findOne({ _id: houseId });
      if (house) {
        houseObjectId = house._id;
      } else {
        return null;
      }
    }
    return await Favorite.findOneAndDelete({ userId, houseId: houseObjectId });
  }

  async deleteById(id) {
    return await Favorite.findByIdAndDelete(id);
  }

  async isFavorite(userId, houseId) {
    let houseObjectId = houseId;
    if (!mongoose.Types.ObjectId.isValid(houseId)) {
      const house = await House.findOne({ _id: houseId });
      if (house) {
        houseObjectId = house._id;
      } else {
        return false;
      }
    }
    const favorite = await Favorite.findOne({ userId, houseId: houseObjectId });
    return !!favorite;
  }
}

module.exports = new FavoriteRepository();
