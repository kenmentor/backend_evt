import { Router } from "express";

import admin_pannel_route from "./admin-panel-route";
import user_route from "./user-route";
import complete_verification_route from "./complete-verification";
import house_route from "./house-route";
import payment_route from "./payment-route";
import auth_route from "./authentication-route";
import feedback_route from "./feedback-route";
import booking_route from "./booking-route";
import request_route from "./request-route";
import demand_route from "./demand-route";
import chat_route from "./chat-route";
import tour_route from "./tour-route";
import favorite_route from "./favorite-route";
import payout_route from "./payout-route";
import analytics_route from "./analytics-route";

const router = Router();

router.use("/house", house_route);
router.use("/auth", auth_route);
router.use("/feedback", feedback_route);
router.use("/verification", complete_verification_route);
router.use("/booking", booking_route);
router.use("/request", request_route);
router.use("/user", user_route);
router.use("/payment", payment_route);
router.use("/demand", demand_route);
router.use("/chat", chat_route);
router.use("/tour", tour_route);
router.use("/favorites", favorite_route);
router.use("/payout", payout_route);
router.use("/analytics", analytics_route);

export default router;
