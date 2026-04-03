const express = require("express");
const router = express.Router();
const { analytics_controller } = require("../../controllers");

// Track single event
router.post("/track", analytics_controller.trackEvent);

// Track batch events
router.post("/track/batch", analytics_controller.trackBatchEvents);

// Get analytics overview
router.get("/overview", analytics_controller.getOverview);

// Get top properties
router.get("/top-properties", analytics_controller.getTopProperties);

// Get user journeys
router.get("/journeys", analytics_controller.getUserJourney);

// Get page visits matrix
router.get("/page-visits", analytics_controller.getPageVisits);

// Get page timeline with visits over time
router.get("/page-timeline", analytics_controller.getPageTimeline);

// Get user registration stats
router.get("/user-registration", analytics_controller.getUserRegistrationStats);

// Get property analytics (views, likes, shares)
router.get("/property-analytics", analytics_controller.getPropertyAnalytics);

// Get user engagement metrics
router.get("/user-engagement", analytics_controller.getUserEngagement);

// Get conversion funnel
router.get("/conversion-funnel", analytics_controller.getConversionFunnel);

module.exports = router;