import mongoose from "mongoose";
import { favoriteCmd } from "../es/commands/favorite";
import { analyticsCmd } from "../es/commands/analytics";
import { queryFavorites } from "../es/queries";
import { projectionHandlers } from "../es/projection";

class FavoriteService {
  async addFavorite(userId: string, houseId: string) {
    const existing = await queryFavorites.isFavorited(userId, houseId);
    if (existing) {
      throw new Error("Property already in favorites");
    }

    const favoriteId = new mongoose.Types.ObjectId().toString();

    await favoriteCmd.add(favoriteId, { userId, houseId });

    try {
      const analyticsId = new mongoose.Types.ObjectId().toString();
      await analyticsCmd.record(analyticsId, {
        eventType: "property_interaction",
        action: "like",
        userId,
        metadata: { propertyId: houseId },
      });
      await projectionHandlers.analytics.runOnce();
    } catch (e) {}

    await projectionHandlers.favorites.runOnce();
    return await queryFavorites.getByAggregateId(favoriteId);
  }

  async removeFavorite(userId: string, houseId: string) {
    const favs = await queryFavorites.getByUser(userId);
    const favorite = favs.find(f => f.houseId === houseId);
    if (!favorite) {
      throw new Error("Favorite not found");
    }

    await favoriteCmd.remove(favorite.favoriteId, {});
    await projectionHandlers.favorites.runOnce();

    try {
      const analyticsId = new mongoose.Types.ObjectId().toString();
      await analyticsCmd.record(analyticsId, {
        eventType: "property_interaction",
        action: "unlike",
        userId,
        metadata: { propertyId: houseId },
      });
      await projectionHandlers.analytics.runOnce();
    } catch (e) {}

    return;
  }

  async getUserFavorites(userId: string) {
    return await queryFavorites.getByUser(userId);
  }

  async isFavorite(userId: string, houseId: string) {
    return await queryFavorites.isFavorited(userId, houseId);
  }

  async toggleFavorite(userId: string, houseId: string) {
    const isFav = await this.isFavorite(userId, houseId);
    if (isFav) {
      await this.removeFavorite(userId, houseId);
      return { isFavorite: false, action: "removed" as const };
    } else {
      await this.addFavorite(userId, houseId);
      return { isFavorite: true, action: "added" as const };
    }
  }
}

export default new FavoriteService();
