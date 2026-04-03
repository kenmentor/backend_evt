const favoriteRepository = require("../repositories/favorite-repository");
const Analytics = require("../modules/analytics");

class FavoriteService {
  async addFavorite(userId, houseId) {
    const existing = await favoriteRepository.findByUserAndHouse(userId, houseId);
    if (existing) {
      throw new Error("Property already in favorites");
    }

    const favorite = await favoriteRepository.create({ userId, houseId });

    await Analytics.create({
      type: "property_interaction",
      action: "like",
      userId,
      metadata: { propertyId: houseId },
      sessionId: null,
      timestamp: new Date(),
    }).catch(() => {});

    return favorite;
  }

  async removeFavorite(userId, houseId) {
    const favorite = await favoriteRepository.findByUserAndHouse(userId, houseId);
    if (!favorite) {
      throw new Error("Favorite not found");
    }

    await favoriteRepository.delete(userId, houseId);

    await Analytics.create({
      type: "property_interaction",
      action: "unlike",
      userId,
      metadata: { propertyId: houseId },
      sessionId: null,
      timestamp: new Date(),
    }).catch(() => {});

    return;
  }

  async getUserFavorites(userId) {
    return await favoriteRepository.findByUserId(userId);
  }

  async isFavorite(userId, houseId) {
    return await favoriteRepository.isFavorite(userId, houseId);
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
