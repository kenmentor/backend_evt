import { Router } from "express";
import { analytics_controller } from "../../controllers";

const router = Router();

router.post("/track", analytics_controller.trackEvent);

router.post("/track/batch", analytics_controller.trackBatchEvents);

router.get("/overview", analytics_controller.getOverview);

router.get("/top-properties", analytics_controller.getTopProperties);

router.get("/journeys", analytics_controller.getUserJourney);

router.get("/page-visits", analytics_controller.getPageVisits);

router.get("/page-timeline", analytics_controller.getPageTimeline);

router.get("/user-registration", analytics_controller.getUserRegistrationStats);

router.get("/property-analytics", analytics_controller.getPropertyAnalytics);

router.get("/user-engagement", analytics_controller.getUserEngagement);

router.get("/conversion-funnel", analytics_controller.getConversionFunnel);

router.get("/engagement-metrics", analytics_controller.getEngagementMetrics);

router.get("/device-analytics", analytics_controller.getDeviceAnalytics);

router.get("/traffic-sources", analytics_controller.getTrafficSources);

router.get("/search-analytics", analytics_controller.getSearchAnalytics);

router.get("/property-analytics-detailed", analytics_controller.getPropertyAnalyticsDetailed);

router.get("/time-on-page", analytics_controller.getTimeOnPageAnalytics);

router.get("/session-analytics", analytics_controller.getSessionAnalytics);

router.get("/retention-analytics", analytics_controller.getRetentionAnalytics);

router.get("/real-time", analytics_controller.getRealTimeAnalytics);

router.get("/user-behavior", analytics_controller.getUserBehaviorMetrics);

export default router;
