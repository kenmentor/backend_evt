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

async function getEngagementMetrics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const engagement = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: { $in: ["engagement", "click", "form"] },
      },
    },
    {
      $group: {
        _id: {
          type: "$type",
          action: "$action",
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        eventType: "$_id.type",
        action: "$_id.action",
        count: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const scrollStats = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: "engagement",
        action: { $in: ["scroll_50", "scroll_90"] },
      },
    },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: "$sessionId" },
      },
    },
  ]);

  return { engagement, scrollStats };
}

async function getDeviceAnalytics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const deviceStats = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        "metadata.deviceType": { $exists: true },
      },
    },
    {
      $group: {
        _id: "$metadata.deviceType",
        sessions: { $addToSet: "$sessionId" },
        pageViews: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        deviceType: "$_id",
        sessions: { $size: "$sessions" },
        pageViews: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
  ]);

  const screenSizes = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        "metadata.screenWidth": { $exists: true },
      },
    },
    {
      $group: {
        _id: {
          width: "$metadata.screenWidth",
          height: "$metadata.screenHeight",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return { deviceStats, screenSizes };
}

async function getTrafficSources(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sources = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        $or: [
          { "metadata.utm_source": { $exists: true, $ne: null } },
          { referrer: { $exists: true, $ne: null } },
        ],
      },
    },
    {
      $group: {
        _id: {
          source: { $ifNull: ["$metadata.utm_source", "$referrer"] },
        },
        sessions: { $addToSet: "$sessionId" },
        pageViews: { $sum: 1 },
      },
    },
    {
      $project: {
        source: "$_id.source",
        sessions: { $size: "$sessions" },
        pageViews: 1,
      },
    },
    { $sort: { pageViews: -1 } },
    { $limit: 20 },
  ]);

  return sources;
}

async function getSearchAnalytics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const searches = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: "search",
      },
    },
    {
      $group: {
        _id: "$metadata.query",
        count: { $sum: 1 },
        avgResults: { $avg: "$metadata.resultsCount" },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        query: "$_id",
        count: 1,
        avgResults: { $round: ["$avgResults", 1] },
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 50 },
  ]);

  return searches;
}

async function getPropertyAnalyticsDetailed(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const interactions = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: { $in: ["property_view", "property_interaction"] },
      },
    },
    {
      $group: {
        _id: "$metadata.propertyId",
        views: {
          $sum: { $cond: [{ $eq: ["$type", "property_view"] }, 1, 0] }
        },
        likes: {
          $sum: { $cond: [{ $and: [{ $eq: ["$type", "property_interaction"] }, { $eq: ["$action", "like"] }] }, 1, 0] }
        },
        shares: {
          $sum: { $cond: [{ $eq: ["$action", "share"] }, 1, 0] }
        },
        contacts: {
          $sum: { $cond: [{ $eq: ["$action", "contact"] }, 1, 0] }
        },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        propertyId: "$_id",
        views: 1,
        likes: 1,
        shares: 1,
        contacts: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        engagementRate: {
          $cond: [
            { $eq: ["$views", 0] },
            0,
            { $round: [{ $multiply: [{ $divide: [{ $add: ["$likes", "$shares", "$contacts"] }, "$views"] }, 100] }, 1] }
          ]
        },
      },
    },
    { $sort: { views: -1 } },
    { $limit: 50 },
  ]);

  return interactions;
}

async function getTimeOnPageAnalytics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pageTimes = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: "page_view",
        "metadata.duration": { $exists: true },
      },
    },
    {
      $group: {
        _id: "$metadata.page",
        avgDuration: { $avg: "$metadata.duration" },
        totalDuration: { $sum: "$metadata.duration" },
        sessions: { $addToSet: "$sessionId" },
        maxDuration: { $max: "$metadata.duration" },
      },
    },
    {
      $project: {
        page: "$_id",
        avgDuration: { $round: ["$avgDuration", 1] },
        totalDuration: 1,
        sessions: { $size: "$sessions" },
        maxDuration: 1,
      },
    },
    { $sort: { avgDuration: -1 } },
  ]);

  return pageTimes;
}

async function getSessionAnalytics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sessions = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        sessionId: { $exists: true },
      },
    },
    {
      $sort: { sessionId: 1, timestamp: 1 },
    },
    {
      $group: {
        _id: "$sessionId",
        userId: { $first: "$userId" },
        pageCount: { $sum: 1 },
        pages: { $push: "$metadata.page" },
        firstSeen: { $min: "$timestamp" },
        lastSeen: { $max: "$timestamp" },
        duration: {
          $subtract: [
            { $max: "$timestamp" },
            { $min: "$timestamp" }
          ]
        },
        actions: { $push: "$action" },
      },
    },
    {
      $project: {
        sessionId: "$_id",
        userId: 1,
        pageCount: 1,
        pages: 1,
        firstSeen: 1,
        lastSeen: 1,
        durationSeconds: { $divide: ["$duration", 1000] },
        durationMinutes: { $divide: ["$duration", 60000] },
        hasUser: { $cond: [{ $eq: ["$userId", null] }, false, true] },
        actions: 1,
      },
    },
  ]);

  const totalSessions = sessions.length;
  const sessionsWithUser = sessions.filter(s => s.userId !== null).length;
  const sessionsWithoutUser = totalSessions - sessionsWithUser;
  
  const bounceSessions = sessions.filter(s => s.pageCount === 1).length;
  const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 100) : 0;

  const avgPagesPerSession = totalSessions > 0 
    ? Math.round((sessions.reduce((sum, s) => sum + s.pageCount, 0) / totalSessions) * 10) / 10 
    : 0;

  const avgSessionDuration = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / totalSessions)
    : 0;

  const exitPages = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: "page_view",
        action: "exit",
      },
    },
    {
      $group: {
        _id: "$metadata.page",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const pageDepthDistribution = [
    { pages: "1", count: sessions.filter(s => s.pageCount === 1).length, label: "1 page (Bounce)" },
    { pages: "2-3", count: sessions.filter(s => s.pageCount >= 2 && s.pageCount <= 3).length, label: "2-3 pages" },
    { pages: "4-6", count: sessions.filter(s => s.pageCount >= 4 && s.pageCount <= 6).length, label: "4-6 pages" },
    { pages: "7+", count: sessions.filter(s => s.pageCount >= 7).length, label: "7+ pages" },
  ];

  return {
    totalSessions,
    sessionsWithUser,
    sessionsWithoutUser,
    bounceSessions,
    bounceRate,
    avgPagesPerSession,
    avgSessionDuration,
    exitPages,
    pageDepthDistribution,
    sessionsByDuration: [
      { range: "0-30s", count: sessions.filter(s => s.durationSeconds <= 30).length },
      { range: "30s-2m", count: sessions.filter(s => s.durationSeconds > 30 && s.durationSeconds <= 120).length },
      { range: "2-5m", count: sessions.filter(s => s.durationSeconds > 120 && s.durationSeconds <= 300).length },
      { range: "5-15m", count: sessions.filter(s => s.durationSeconds > 300 && s.durationSeconds <= 900).length },
      { range: "15m+", count: sessions.filter(s => s.durationSeconds > 900).length },
    ],
  };
}

async function getRetentionAnalytics(days = 30) {
  const userDB = require("../modules/user");
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const totalUsers = await userDB.countDocuments({ createdAt: { $gte: startDate } });

  const dailyActiveUsers = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        userId: { $ne: null },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
        },
        users: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        date: "$_id",
        dau: { $size: "$users" },
      },
    },
    { $sort: { date: 1 } },
  ]);

  const monthlyActiveUsers = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: new Date(now.getTime() - 30 * dayMs) },
        userId: { $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        users: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        mau: { $size: "$users" },
      },
    },
  ]);

  const mau = monthlyActiveUsers[0]?.mau || 0;
  const dau = dailyActiveUsers.length > 0 ? dailyActiveUsers[dailyActiveUsers.length - 1]?.dau || 0 : 0;
  const dauMauRatio = mau > 0 ? Math.round((dau / mau) * 1000) / 10 : 0;

  const newUsersByDay = await userDB.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const returningUsers = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        userId: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$userId",
        sessionCount: { $sum: 1 },
        firstSeen: { $min: "$timestamp" },
        lastSeen: { $max: "$timestamp" },
      },
    },
    {
      $match: {
        sessionCount: { $gt: 1 },
      },
    },
  ]);

  const day1Retention = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: new Date(now.getTime() - 2 * dayMs), $lt: new Date(now.getTime() - 1 * dayMs) },
        userId: { $ne: null },
      },
    },
    {
      $group: { _id: "$userId" },
    },
    {
      $count: "users",
    },
  ]);

  const day1RetainedUsers = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: new Date(now.getTime() - 1 * dayMs) },
        userId: { $ne: null },
      },
    },
    {
      $group: { _id: "$userId" },
    },
  ]);

  const day1RetentionRate = day1Retention[0]?.users > 0 && day1RetainedUsers.length > 0
    ? Math.round((day1RetainedUsers.length / day1Retention[0].users) * 100)
    : 0;

  return {
    totalUsers,
    dailyActiveUsers,
    monthlyActiveUsers: mau,
    dauMauRatio,
    newUsersByDay,
    returningUsersCount: returningUsers.length,
    day1RetentionRate,
    returningUsers: returningUsers.slice(0, 20).map(u => ({
      userId: u._id,
      sessions: u.sessionCount,
      firstSeen: u.firstSeen,
      lastSeen: u.lastSeen,
    })),
  };
}

async function getRealTimeAnalytics() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const activeUsersNow = await analyticsDB.distinct("sessionId", {
    timestamp: { $gte: fiveMinutesAgo },
  });

  const lastHourEvents = await analyticsDB.find({
    timestamp: { $gte: oneHourAgo },
  }).sort({ timestamp: -1 }).limit(50);

  const lastHourPageViews = await analyticsDB.countDocuments({
    timestamp: { $gte: oneHourAgo },
    type: "page_view",
  });

  const lastHourPropertyViews = await analyticsDB.countDocuments({
    timestamp: { $gte: oneHourAgo },
    type: "property_view",
  });

  const eventsByType = await analyticsDB.aggregate([
    {
      $match: { timestamp: { $gte: oneHourAgo } },
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return {
    activeUsersNow: activeUsersNow.length,
    lastHourPageViews,
    lastHourPropertyViews,
    recentEvents: lastHourEvents.map(e => ({
      type: e.type,
      action: e.action,
      page: e.metadata?.page,
      timestamp: e.timestamp,
    })),
    eventsByType,
  };
}

async function getUserBehaviorMetrics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const clickEvents = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: "click",
      },
    },
    {
      $group: {
        _id: { location: "$metadata.location", action: "$action" },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        location: "$_id.location",
        action: "$_id.action",
        clicks: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
    { $sort: { clicks: -1 } },
    { $limit: 20 },
  ]);

  const formEvents = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        type: "form",
      },
    },
    {
      $group: {
        _id: "$metadata.formName",
        starts: { $sum: { $cond: [{ $eq: ["$action", "start"] }, 1, 0] } },
        submits: { $sum: { $cond: [{ $eq: ["$action", "submit"] }, 1, 0] } },
        errors: { $sum: { $cond: [{ $eq: ["$action", "error"] }, 1, 0] } },
        abandons: { $sum: { $cond: [{ $eq: ["$action", "abandon"] }, 1, 0] } },
      },
    },
    {
      $project: {
        formName: "$_id",
        starts: 1,
        submits: 1,
        errors: 1,
        abandons: 1,
        completionRate: {
          $cond: [
            { $eq: ["$starts", 0] },
            0,
            { $round: [{ $multiply: [{ $divide: ["$submits", "$starts"] }, 100] }, 1] }
          ]
        },
        abandonmentRate: {
          $cond: [
            { $eq: ["$starts", 0] },
            0,
            { $round: [{ $multiply: [{ $divide: ["$abandons", "$starts"] }, 100] }, 1] }
          ]
        },
      },
    },
    { $sort: { starts: -1 } },
  ]);

  const dropOffPoints = await analyticsDB.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        action: "exit",
      },
    },
    {
      $group: {
        _id: "$metadata.page",
        exitCount: { $sum: 1 },
      },
    },
    { $sort: { exitCount: -1 } },
    { $limit: 10 },
  ]);

  return {
    clickEvents,
    formEvents,
    dropOffPoints,
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