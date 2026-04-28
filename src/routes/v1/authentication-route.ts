import { Router } from "express";
import { user_controller, auth_controller } from "../../controllers";
import { user_middleware, auth_middleware } from "../../middle-ware";

const router = Router();

router.post("/login", auth_middleware.login_user, user_controller.login_user);

router.post(
  "/signup",
  user_middleware.user_create,
  user_controller.signup_user
);

router.post("/logout", user_controller.logout_user);

router.post("/forgot_password", user_controller.forgot_password);

router.post("/reset_password/:token", user_controller.reset_password);
router.get("/check_auth", auth_controller.auth_check);
router.get("/me", auth_controller.auth_check);
export default router;
