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

async function getPageVisits(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pageStats = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: "page_view",
      },
    },
    {
      $group: {
        _id: "$metadata.page",
        totalVisits: { $sum: 1 },
        uniqueUsers: { $addToSet: "$sessionId" },
        totalDuration: { $sum: "$metadata.duration" },
        avgDuration: { $avg: "$metadata.duration" },
      },
    },
    {
      $project: {
        page: "$_id",
        totalVisits: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        totalDuration: { $ifNull: ["$totalDuration", 0] },
        avgDuration: { $round: [{ $ifNull: ["$avgDuration", 0] }, 1] },
      },
    },
    { $sort: { totalVisits: -1 } },
  ]);

  return pageStats;
}

async function getPageTimeline(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const timeline = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: "page_view",
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          page: "$metadata.page",
        },
        visits: { $sum: 1 },
        uniqueUsers: { $addToSet: "$sessionId" },
        avgDuration: { $avg: "$metadata.duration" },
      },
    },
    {
      $project: {
        date: "$_id.date",
        page: "$_id.page",
        visits: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        avgDuration: { $round: [{ $ifNull: ["$avgDuration", 0] }, 1] },
      },
    },
    { $sort: { date: 1, visits: -1 } },
  ]);

  return timeline;
}

async function getPropertyAnalytics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const propertyViews = await analyticsDB.aggregate([
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
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        propertyId: "$_id",
        views: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
    { $sort: { views: -1 } },
    { $limit: 20 },
  ]);

  const propertyLikes = await analyticsDB.aggregate([
    {
      $match: {
        type: "property_interaction",
        action: "like",
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$metadata.propertyId",
        likes: { $sum: 1 },
        users: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        propertyId: "$_id",
        likes: 1,
        uniqueLikers: { $size: "$users" },
      },
    },
    { $sort: { likes: -1 } },
  ]);

  const propertyShares = await analyticsDB.aggregate([
    {
      $match: {
        type: "property_interaction",
        action: "share",
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$metadata.propertyId",
        shares: { $sum: 1 },
      },
    },
    { $sort: { shares: -1 } },
  ]);

  return { propertyViews, propertyLikes, propertyShares };
}

async function getUserEngagement(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const userActions = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        userId: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$userId",
        totalActions: { $sum: 1 },
        sessions: { $addToSet: "$sessionId" },
        pagesVisited: { $addToSet: "$metadata.page" },
        propertyViews: {
          $sum: { $cond: [{ $eq: ["$type", "property_view"] }, 1, 0] }
        },
        propertyLikes: {
          $sum: { $cond: [{ $and: [{ $eq: ["$type", "property_interaction"] }, { $eq: ["$action", "like"] }] }, 1, 0] }
        },
      },
    },
    {
      $project: {
        userId: "$_id",
        totalActions: 1,
        sessionCount: { $size: "$sessions" },
        pagesVisited: { $size: "$pagesVisited" },
        propertyViews: 1,
        propertyLikes: 1,
        engagementScore: {
          $add: [
            { $multiply: ["$propertyViews", 2] },
            { $multiply: ["$propertyLikes", 3] },
            { $multiply: [{ $size: "$pagesVisited" }, 1] }
          ]
        },
      },
    },
    { $sort: { engagementScore: -1 } },
    { $limit: 50 },
  ]);

  const avgEngagement = userActions.length > 0
    ? Math.round(userActions.reduce((sum, u) => sum + u.engagementScore, 0) / userActions.length)
    : 0;

  return { topUsers: userActions, avgEngagement, totalActiveUsers: userActions.length };
}

async function getConversionFunnel(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [visitors, signups, logins, verified, propertyViews, propertyLikes] = await Promise.all([
    analyticsDB.distinct("sessionId", { timestamp: { $gte: startDate } }),
    analyticsDB.distinct("userId", { type: "signup", timestamp: { $gte: startDate } }),
    analyticsDB.distinct("userId", { type: "login", timestamp: { $gte: startDate } }),
    analyticsDB.distinct("userId", { type: "verification", action: "success", timestamp: { $gte: startDate } }),
    analyticsDB.distinct("sessionId", { type: "property_view", timestamp: { $gte: startDate } }),
    analyticsDB.distinct("sessionId", { type: "property_interaction", action: "like", timestamp: { $gte: startDate } }),
  ]);

  return {
    visitors: visitors.length,
    signups: signups.length,
    logins: logins.length,
    verified: verified.length,
    propertyViews: propertyViews.length,
    propertyLikes: propertyLikes.length,
    conversionRates: {
      visitorToSignup: visitors.length > 0 ? Math.round((signups.length / visitors.length) * 100) : 0,
      signupToLogin: signups.length > 0 ? Math.round((logins.length / signups.length) * 100) : 0,
      loginToVerified: logins.length > 0 ? Math.round((verified.length / logins.length) * 100) : 0,
      visitorToPropertyView: visitors.length > 0 ? Math.round((propertyViews.length / visitors.length) * 100) : 0,
      propertyViewToLike: propertyViews.length > 0 ? Math.round((propertyLikes.length / propertyViews.length) * 100) : 0,
    }
  };
}

async function getUserRegistrationStats(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const userDB = require("../modules/user");

  const registrationStats = await userDB.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalUsers = await userDB.countDocuments();

  return {
    dailyRegistrations: registrationStats,
    totalUsers,
  };
}

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
};