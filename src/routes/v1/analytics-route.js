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

module.exports = router;