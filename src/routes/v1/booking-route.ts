import { Router } from "express";
import { booking_controller } from "../../controllers";
import { booking_middleware } from "../../middle-ware";

const router = Router();

router.post(
  "/:id",
  booking_middleware.booking_create,
  booking_controller.create_booking
);

router.get("/:userId/:bookingId", booking_middleware.CookieValidity, booking_controller.get_booking_details);

router.get("/:userId", booking_middleware.CookieValidity, booking_controller.get_all_booking);

export default router;
