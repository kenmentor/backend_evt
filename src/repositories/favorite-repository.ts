import mongoose from "mongoose";
import Favorite, { type IFavorite } from "../modules/favorite";
import House from "../modules/resource";

class FavoriteRepository {
  async create(favoriteData: Partial<IFavorite>) {
    const favorite = new Favorite(favoriteData);
    return await favorite.save();
  }

  async findByUserId(userId: string) {
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

  async findByUserAndHouse(userId: string, houseId: string) {
    let houseObjectId: any = houseId;
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

  async delete(userId: string, houseId: string) {
    let houseObjectId: any = houseId;
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

  async deleteById(id: string) {
    return await Favorite.findByIdAndDelete(id);
  }

  async isFavorite(userId: string, houseId: string) {
    let houseObjectId: any = houseId;
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

export default new FavoriteRepository();
