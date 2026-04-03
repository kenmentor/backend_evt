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

// Get engagement metrics (scroll, clicks, forms)
router.get("/engagement-metrics", analytics_controller.getEngagementMetrics);

// Get device analytics
router.get("/device-analytics", analytics_controller.getDeviceAnalytics);

// Get traffic sources
router.get("/traffic-sources", analytics_controller.getTrafficSources);

// Get search analytics
router.get("/search-analytics", analytics_controller.getSearchAnalytics);

// Get detailed property analytics
router.get("/property-analytics-detailed", analytics_controller.getPropertyAnalyticsDetailed);

// Get time on page analytics
router.get("/time-on-page", analytics_controller.getTimeOnPageAnalytics);

// Session analytics (bounce rate, session depth, duration)
router.get("/session-analytics", analytics_controller.getSessionAnalytics);

// Retention analytics (DAU, MAU, returning users)
router.get("/retention-analytics", analytics_controller.getRetentionAnalytics);

// Real-time analytics (active users now)
router.get("/real-time", analytics_controller.getRealTimeAnalytics);

// User behavior metrics (clicks, forms, drop-offs)
router.get("/user-behavior", analytics_controller.getUserBehaviorMetrics);

module.exports = router;