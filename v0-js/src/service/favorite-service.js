/**
 * Favorite Service - Event Sourcing Version
 */

const { getRepos } = require("../event-sourcing");
const mongoose = require("mongoose");
const { Analytics } = require("../modules/analytics");

function getFavoriteRepo() {
  const { favoriteEventRepo } = getRepos();
  return favoriteEventRepo;
}

class FavoriteService {
  async addFavorite(userId, houseId) {
    const repo = getFavoriteRepo();
    
    // Check if already exists
    const existing = await repo.findOne({ userId, houseId });
    if (existing) {
      throw new Error("Property already in favorites");
    }

    const favoriteId = new mongoose.Types.ObjectId().toString();
    
    await repo.create({
      _id: favoriteId,
      userId,
      houseId,
    });

    // Track analytics
    try {
      await Analytics.create({
        type: "property_interaction",
        action: "like",
        userId,
        metadata: { propertyId: houseId },
        sessionId: null,
        timestamp: new Date(),
      });
    } catch (e) {}

    return await repo.findById(favoriteId);
  }

  async removeFavorite(userId, houseId) {
    const repo = getFavoriteRepo();
    
    const favorite = await repo.findOne({ userId, houseId });
    if (!favorite) {
      throw new Error("Favorite not found");
    }

    await repo.commands.remove(favorite._id);
    await repo.handler.runOnce();

    // Track analytics
    try {
      await Analytics.create({
        type: "property_interaction",
        action: "unlike",
        userId,
        metadata: { propertyId: houseId },
        sessionId: null,
        timestamp: new Date(),
      });
    } catch (e) {}

    return;
  }

  async getUserFavorites(userId) {
    const repo = getFavoriteRepo();
    return await repo.find({ userId });
  }

  async isFavorite(userId, houseId) {
    const repo = getFavoriteRepo();
    const favorite = await repo.findOne({ userId, houseId });
    return !!favorite;
  }

  async toggleFavorite(userId, houseId) {
    const isFav = await this.isFavorite(userId, houseId);
    if (isFav) {
      await this.removeFavorite(userId, houseId);
      return { isFavorite: false, action: "removed" };
    } else {
      await this.addFavorite(userId, houseId);
      return { isFavorite: true, action: "added" };
    }
  }
}

module.exports = new FavoriteService();
