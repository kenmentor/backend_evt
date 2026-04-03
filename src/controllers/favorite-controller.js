const favoriteService = require("../service/favorite-service");
const { response } = require("../utility");

const addFavorite = async (req, res) => {
  const Response = response;
  try {
    const { userId, houseId } = req.body;
    const favorite = await favoriteService.addFavorite(userId, houseId);
    Response.goodResponse.data = favorite;
    Response.goodResponse.message = "Added to favorites";
    return res.status(201).json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = error.message || "Failed to add favorite";
    Response.badResponse.status = 400;
    return res.status(400).json(Response.badResponse);
  }
};

const removeFavorite = async (req, res) => {
  const Response = response;
  try {
    const { userId, houseId } = req.body;
    await favoriteService.removeFavorite(userId, houseId);
    Response.goodResponse.message = "Removed from favorites";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = error.message || "Failed to remove favorite";
    Response.badResponse.status = 400;
    return res.status(400).json(Response.badResponse);
  }
};

const getUserFavorites = async (req, res) => {
  const Response = response;
  try {
    const favorites = await favoriteService.getUserFavorites(req.params.userId);
    Response.goodResponse.data = favorites;
    Response.goodResponse.message = "Favorites retrieved successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get favorites";
    return res.status(500).json(Response.badResponse);
  }
};

const checkFavorite = async (req, res) => {
  const Response = response;
  try {
    const { userId, houseId } = req.params;
    const isFavorite = await favoriteService.isFavorite(userId, houseId);
    Response.goodResponse.data = { isFavorite };
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to check favorite status";
    return res.status(500).json(Response.badResponse);
  }
};

const toggleFavorite = async (req, res) => {
  const Response = response;
  try {
    const { userId, houseId } = req.body;
    const result = await favoriteService.toggleFavorite(userId, houseId);
    Response.goodResponse.data = result;
    Response.goodResponse.message = result.action === "added" ? "Added to favorites" : "Removed from favorites";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = error.message || "Failed to toggle favorite";
    Response.badResponse.status = 400;
    return res.status(400).json(Response.badResponse);
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  checkFavorite,
  toggleFavorite,
};
