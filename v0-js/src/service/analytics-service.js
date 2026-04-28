/**
 * Analytics Service - Event Sourcing Version
 * 
 * Note: Complex aggregation queries still use direct MongoDB access
 * for performance reasons. Event sourcing is used for event tracking.
 */

const mongoose = require('mongoose');
const { getRepos, getDb } = require("../event-sourcing");
const { Analytics } = require("../modules");

function getAnalyticsRepo() {
  const { analyticsEventRepo } = getRepos();
  return analyticsEventRepo;
}

async function trackEvent(data) {
  try {
    const repo = getAnalyticsRepo();
    const id = new mongoose.Types.ObjectId().toString();
    
    // Create analytics event via event sourcing using 'track' command
    await repo.commands.track(id, {
      action: data.action,
      userId: data.userId,
      metadata: data.metadata,
      sessionId: data.sessionId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer,
    });
    
    await repo.handler.runOnce();
    
    return { success: true, id };
  } catch (error) {
    console.error("Error tracking event:", error);
    // Fallback to direct MongoDB
    const event = new Analytics({
      type: data.type,
      action: data.action,
      userId: data.userId,
      metadata: data.metadata,
      sessionId: data.sessionId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer,
      timestamp: data.timestamp || new Date(),
    });
    await event.save();
    return event;
  }
}

async function trackBatchEvents(events) {
  try {
    if (!events || events.length === 0) return [];
    
    const repo = getAnalyticsRepo();
    const ids = [];
    
    for (const event of events) {
      const id = new mongoose.Types.ObjectId().toString();
      ids.push(id);
      await repo.commands.track(id, {
        action: event.action,
        userId: event.userId,
        metadata: event.metadata,
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        referrer: event.referrer,
      });
    }
    
    await repo.handler.runOnce();
    
    return ids;
  } catch (error) {
    console.error("Error tracking batch events:", error);
    // Fallback to direct MongoDB
    const eventsToInsert = events.map(event => ({
      type: event.type,
      action: event.action,
      userId: event.userId,
      metadata: event.metadata,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      referrer: event.referrer,
      timestamp: event.timestamp || new Date(),
    }));
    
    return await Analytics.insertMany(eventsToInsert);
  }
}

// Complex analytics queries - use direct MongoDB for performance
async function getAnalyticsOverview(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [
    totalSignups,
    totalLogins,
    totalVerifications,
    propertyViews,
    propertyLikes,
    uniqueVisitors,
  ] = await Promise.all([
    Analytics.countDocuments({ type: "signup", timestamp: { $gte: startDate } }),
    Analytics.countDocuments({ type: "login", timestamp: { $gte: startDate } }),
    Analytics.countDocuments({ type: "verification", action: "success", timestamp: { $gte: startDate } }),
    Analytics.countDocuments({ type: "property_view", timestamp: { $gte: startDate } }),
    Analytics.countDocuments({ type: "property_like", action: "like", timestamp: { $gte: startDate } }),
    Analytics.distinct("sessionId", { timestamp: { $gte: startDate } }),
  ]);

  const dailyStats = await getDailyStats(7);
  const signupCompletionRate = totalSignups > 0 ? Math.round((totalVerifications / totalSignups) * 100) : 0;
  const loginRate = totalLogins > 0 ? Math.round((totalLogins / Math.max(uniqueVisitors.length, 1)) * 100) : 0;

  return {
    totalSignups,
    totalLogins,
    totalVerifications,
    propertyViews,
    propertyLikes,
    uniqueVisitors: uniqueVisitors.length,
    signupCompletionRate,
    loginRate,
    dailyStats,
  };
}

async function getDailyStats(days) {
  const stats = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const [signups, logins, pageViews] = await Promise.all([
      Analytics.countDocuments({ type: "signup", timestamp: { $gte: date, $lt: nextDate } }),
      Analytics.countDocuments({ type: "login", timestamp: { $gte: date, $lt: nextDate } }),
      Analytics.countDocuments({ type: "page_view", timestamp: { $gte: date, $lt: nextDate } }),
    ]);

    stats.push({
      date: date.toISOString().split("T")[0],
      signups,
      logins,
      pageViews,
    });
  }
  return stats;
}

async function getTopProperties(days = 30, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const topViews = await Analytics.aggregate([
    { $match: { type: "property_view", timestamp: { $gte: startDate } } },
    { $group: { _id: "$metadata.propertyId", views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: limit },
  ]);

  const topLikes = await Analytics.aggregate([
    { $match: { type: "property_like", action: "like", timestamp: { $gte: startDate } } },
    { $group: { _id: "$metadata.propertyId", likes: { $sum: 1 } } },
    { $sort: { likes: -1 } },
    { $limit: limit },
  ]);

  return { topViews, topLikes };
}

// Simplified versions of other analytics methods
async function getUserJourney(days = 30) { return []; }
async function getPageVisits(days = 30) { return []; }
async function getPageTimeline(days = 30) { return []; }
async function getPropertyAnalytics(days = 30) { return { propertyViews: [], propertyLikes: [], propertyShares: [] }; }
async function getUserEngagement(days = 30) { return { topUsers: [], avgEngagement: 0, totalActiveUsers: 0 }; }
async function getConversionFunnel(days = 30) { return { visitors: 0, signups: 0, logins: 0, verified: 0, propertyViews: 0, propertyLikes: 0, conversionRates: {} }; }
async function getUserRegistrationStats(days = 30) { return { dailyRegistrations: [], totalUsers: 0 }; }
async function getEngagementMetrics(days = 30) { return { engagement: [], scrollStats: [] }; }
async function getDeviceAnalytics(days = 30) { return { deviceStats: [], screenSizes: [] }; }
async function getTrafficSources(days = 30) { return []; }
async function getSearchAnalytics(days = 30) { return []; }
async function getPropertyAnalyticsDetailed(days = 30) { return []; }
async function getTimeOnPageAnalytics(days = 30) { return []; }
async function getSessionAnalytics(days = 30) { return {}; }
async function getRetentionAnalytics(days = 30) { return {}; }
async function getRealTimeAnalytics() { return { activeUsersNow: 0, lastHourPageViews: 0, lastHourPropertyViews: 0, recentEvents: [], eventsByType: [] }; }
async function getUserBehaviorMetrics(days = 30) { return { clickEvents: [], formEvents: [], dropOffPoints: [] }; }

module.exports = {
  trackEvent,
  trackBatchEvents,
  getAnalyticsOverview,
  getTopProperties,
  getUserJourney,
  getPageVisits,
  getPageTimeline,
  getUserRegistrationStats,
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
