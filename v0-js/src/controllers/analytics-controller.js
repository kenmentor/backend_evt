const { analytics_service } = require("../service");
const { response } = require("../utility");
const { goodResponse, badResponse } = response;

async function trackEvent(req, res) {
  try {
    const data = req.body;
    const event = await analytics_service.trackEvent(data);
    return res.json(goodResponse(event, "Event tracked"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function trackBatchEvents(req, res) {
  try {
    const { events } = req.body;
    const result = await analytics_service.trackBatchEvents(events);
    return res.json(goodResponse(result, "Events tracked"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getOverview(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getAnalyticsOverview(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getTopProperties(req, res) {
  try {
    const { days, limit } = req.query;
    const data = await analytics_service.getTopProperties(parseInt(days) || 30, parseInt(limit) || 10);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getUserJourney(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getUserJourney(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getPageVisits(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getPageVisits(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getUserRegistrationStats(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getUserRegistrationStats(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getPageTimeline(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getPageTimeline(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getPropertyAnalytics(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getPropertyAnalytics(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getUserEngagement(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getUserEngagement(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getConversionFunnel(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getConversionFunnel(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getEngagementMetrics(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getEngagementMetrics(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getDeviceAnalytics(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getDeviceAnalytics(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getTrafficSources(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getTrafficSources(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getSearchAnalytics(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getSearchAnalytics(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getPropertyAnalyticsDetailed(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getPropertyAnalyticsDetailed(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getTimeOnPageAnalytics(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getTimeOnPageAnalytics(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getSessionAnalytics(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getSessionAnalytics(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getRetentionAnalytics(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getRetentionAnalytics(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getRealTimeAnalytics(req, res) {
  try {
    const data = await analytics_service.getRealTimeAnalytics();
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getUserBehaviorMetrics(req, res) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getUserBehaviorMetrics(parseInt(days) || 30);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

module.exports = {
  trackEvent,
  trackBatchEvents,
  getOverview,
  getTopProperties,
  getUserJourney,
  getPageVisits,
  getUserRegistrationStats,
  getPageTimeline,
  getPropertyAnalytics,
  getUserEngagement,
  getConversionFunnel,
  getEngagementMetrics,
  getDeviceAnalytics,
  getTrafficSources,
  getSearchAnalytics,
  getPropertyAnalyticsDetailed,
  getTimeOnPageAnalytics,
  getSessionAnalytics,
  getRetentionAnalytics,
  getRealTimeAnalytics,
  getUserBehaviorMetrics,
};