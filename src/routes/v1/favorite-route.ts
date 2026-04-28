import { Router } from "express";
import { favorite_controller } from "../../controllers";

const router = Router();

router.post("/", favorite_controller.addFavorite);

router.post("/toggle", favorite_controller.toggleFavorite);

router.delete("/", favorite_controller.removeFavorite);

router.get("/:userId", favorite_controller.getUserFavorites);

router.get("/check/:userId/:houseId", favorite_controller.checkFavorite);

export default router;
