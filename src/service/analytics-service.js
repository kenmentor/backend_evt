const { Analytics } = require("../modules");
const { userDB } = require("../modules");

const analyticsDB = Analytics;

async function trackEvent(data) {
  try {
    const event = new analyticsDB({
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
  } catch (error) {
    console.error("Error tracking event:", error);
    throw error;
  }
}

async function trackBatchEvents(events) {
  try {
    if (!events || events.length === 0) return [];
    
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
    
    const result = await analyticsDB.insertMany(eventsToInsert);
    return result;
  } catch (error) {
    console.error("Error tracking batch events:", error);
    throw error;
  }
}

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
    analyticsDB.countDocuments({ type: "signup", timestamp: { $gte: startDate } }),
    analyticsDB.countDocuments({ type: "login", timestamp: { $gte: startDate } }),
    analyticsDB.countDocuments({ type: "verification", action: "success", timestamp: { $gte: startDate } }),
    analyticsDB.countDocuments({ type: "property_view", timestamp: { $gte: startDate } }),
    analyticsDB.countDocuments({ type: "property_like", action: "like", timestamp: { $gte: startDate } }),
    analyticsDB.distinct("sessionId", { timestamp: { $gte: startDate } }),
  ]);

  // Daily stats for the last 7 days
  const dailyStats = await getDailyStats(7);

  // Calculate completion rates
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
      analyticsDB.countDocuments({ type: "signup", timestamp: { $gte: date, $lt: nextDate } }),
      analyticsDB.countDocuments({ type: "login", timestamp: { $gte: date, $lt: nextDate } }),
      analyticsDB.countDocuments({ type: "page_view", timestamp: { $gte: date, $lt: nextDate } }),
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

  const topViews = await analyticsDB.aggregate([
    {
      $match: {
        type: "property_view",
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$metadata.propertyId",
        views: { $sum: 1 },
      },
    },
    { $sort: { views: -1 } },
    { $limit: limit },
  ]);

  const topLikes = await analyticsDB.aggregate([
    {
      $match: {
        type: "property_like",
        action: "like",
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$metadata.propertyId",
        likes: { $sum: 1 },
      },
    },
    { $sort: { likes: -1 } },
    { $limit: limit },
  ]);

  return { topViews, topLikes };
}

async function getUserJourney(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const journeys = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: "page_view",
      },
    },
    {
      $sort: { sessionId: 1, timestamp: 1 },
    },
    {
      $group: {
        _id: "$sessionId",
        path: { $push: "$metadata.page" },
        firstSeen: { $min: "$timestamp" },
      },
    },
    {
      $project: {
        path: 1,
        pathString: { $concat: ["$path"] },
      },
    },
    {
      $group: {
        _id: "$pathString",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return journeys;
}

module.exports = {
  trackEvent,
  trackBatchEvents,
  getAnalyticsOverview,
  getTopProperties,
  getUserJourney,
};