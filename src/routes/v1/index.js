const express = require("express");
const router = express.Router();

const admin_pannel_route = require("./admin-panel-route");
const user_route = require("./user-route");
const complete_verification_route = require("./complete-verification");
const house_route = require("./house-route");
const payment_route = require("./payment-route");
const auth_route = require("./authentication-route");
const feedback_route = require("./feedback-route");
const booking_route = require("./booking-route");
const request_route = require("./request-route");
const demand_route = require("./demand-route");
const chat_route = require("./chat-route");
const tour_route = require("./tour-route");
const favorite_route = require("./favorite-route");
const payout_route = require("./payout-route");

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

module.exports = router;
