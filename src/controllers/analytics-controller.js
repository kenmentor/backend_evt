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

module.exports = {
  trackEvent,
  trackBatchEvents,
  getOverview,
  getTopProperties,
  getUserJourney,
};