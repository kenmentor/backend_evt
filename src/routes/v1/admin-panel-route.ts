import { Router } from "express";
import { user_controller } from "../../controllers";
import { house_controller } from "../../controllers";
import { user_middleware } from "../../middle-ware";

const router = Router();

router.delete(
  "/user",
  user_middleware.user_delete,
  user_controller.delete_user
);

router.put("/users", user_controller.edit_user_detail);

router.get("/houses", house_controller.get_house);
router.get("/houses/:id", house_controller.get_house_detail);
router.delete("/houses", house_controller.delete_house);

export default router;
