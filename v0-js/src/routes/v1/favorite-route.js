const express = require("express");
const router = express.Router();
const { favorite_controller } = require("../../controllers");

router.post("/", favorite_controller.addFavorite);

router.post("/toggle", favorite_controller.toggleFavorite);

router.delete("/", favorite_controller.removeFavorite);

router.get("/:userId", favorite_controller.getUserFavorites);

router.get("/check/:userId/:houseId", favorite_controller.checkFavorite);

module.exports = router;
