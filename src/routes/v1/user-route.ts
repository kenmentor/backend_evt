import { Router } from "express";
import { user_controller } from "../../controllers";
import { user_middleware } from "../../middle-ware";
import { profile_multer } from "../../middle-ware";

const router = Router();

router.put(
  "/:id",
  profile_multer.single("profileImage"),
  user_controller.edit_user_detail
);

router.post(
  "/uploadProfile/:id",
  profile_multer.single("profileImage"),
  user_controller.upload_profile_picture
);

router.get("/pioneer", user_controller.pioneer);
router.get("/:id", user_controller.get_user);
router.get("/", user_controller.find_users);

export default router;
