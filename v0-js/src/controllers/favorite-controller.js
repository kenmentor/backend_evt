const favoriteService = require("../service/favorite-service");
const { response } = require("../utility");
const { goodResponse, badResponse } = response;

const addFavorite = async (req, res) => {
  try {
    const { userId, houseId } = req.body;
    console.log("addFavorite called:", { userId, houseId });
    const favorite = await favoriteService.addFavorite(userId, houseId);
    return res.status(201).json(goodResponse(favorite, "Added to favorites"));
  } catch (error) {
    console.error("addFavorite error:", error.message);
    return res.status(400).json(badResponse(error.message || "Failed to add favorite", 400));
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { userId, houseId } = req.body;
    await favoriteService.removeFavorite(userId, houseId);
    return res.json(goodResponse(null, "Removed from favorites"));
  } catch (error) {
    return res.status(400).json(badResponse(error.message || "Failed to remove favorite", 400));
  }
};

const getUserFavorites = async (req, res) => {
  try {
    const favorites = await favoriteService.getUserFavorites(req.params.userId);
    return res.json(goodResponse(favorites, "Favorites retrieved successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const checkFavorite = async (req, res) => {
  try {
    const { userId, houseId } = req.params;
    const isFavorite = await favoriteService.isFavorite(userId, houseId);
    return res.json(goodResponse({ isFavorite }));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { userId, houseId } = req.body;
    console.log("toggleFavorite called:", { userId, houseId });
    const result = await favoriteService.toggleFavorite(userId, houseId);
    console.log("toggleFavorite result:", result);
    return res.json(goodResponse(result, result.action === "added" ? "Added to favorites" : "Removed from favorites"));
  } catch (error) {
    console.error("toggleFavorite error:", error.message);
    return res.status(400).json(badResponse(error.message || "Failed to toggle favorite", 400));
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  checkFavorite,
  toggleFavorite,
};
