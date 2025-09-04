const express = require("express");
const router = express.Router();
const { user_controller } = require("../../controllers");
const { user_middleware } = require("../../middle-ware");
const { profile_multer } = require("../../middle-ware");

// Update user (with optional profile image)
router.put(
  "/:id",
  profile_multer.single("profileImage"), // multer handles file
  // user_middleware.user_update,
  user_controller.edit_user_detail
);

router.get("/pioneer", user_controller.pioneer);
router.get("/:id", user_controller.get_user);
router.get("/", user_controller.find_users);

module.exports = router;
