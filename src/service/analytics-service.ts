import mongoose from "mongoose";
import { analyticsCmd } from "../es/commands/analytics";
import { queryAnalytics } from "../es/queries";
import { projectionHandlers } from "../es/projection";

export async function trackEvent(data: any) {
  const id = new mongoose.Types.ObjectId().toString();

  await analyticsCmd.record(id, {
    eventType: data.action || data.eventType || '',
    userId: data.userId || '',
    metadata: data.metadata || {},
    action: data.action,
    sessionId: data.sessionId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    referrer: data.referrer,
  });

  await projectionHandlers.analytics.runOnce();

  return { success: true, id };
}

export async function trackBatchEvents(events: any[]) {
  if (!events || events.length === 0) return [];

  const ids: string[] = [];

  for (const event of events) {
    const id = new mongoose.Types.ObjectId().toString();
    ids.push(id);
    await analyticsCmd.record(id, {
      eventType: event.action || event.eventType || '',
      userId: event.userId || '',
      metadata: event.metadata || {},
      action: event.action,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      referrer: event.referrer,
    });
  }

  await projectionHandlers.analytics.runOnce();

  return ids;
}

export async function getAnalyticsOverview(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const results = await queryAnalytics.getAll();

  const filtered = results.filter(a => {
    const ts = new Date(a.createdAt);
    return ts >= startDate;
  });

  const totalEvents = filtered.length;
  const byEventType: Record<string, number> = {};
  for (const a of filtered) {
    byEventType[a.eventType] = (byEventType[a.eventType] || 0) + 1;
  }

  return {
    totalEvents,
    byEventType,
    dailyStats: await getDailyStats(7),
  };
}

async function getDailyStats(days: number) {
  const stats: any[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayEvents = await queryAnalytics.getByTimeRange(date.toISOString(), nextDate.toISOString());

    stats.push({
      date: date.toISOString().split("T")[0],
      count: dayEvents.length,
    });
  }
  return stats;
}

export async function getTopProperties(days: number = 30, limit: number = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const allEvents = await queryAnalytics.getAll();
  const filtered = allEvents.filter(a => new Date(a.createdAt) >= startDate);

  const views: Record<string, number> = {};
  const likes: Record<string, number> = {};

  for (const a of filtered) {
    const propId = (a.metadata as any)?.propertyId as string | undefined;
    if (!propId) continue;
    if (a.eventType === 'property_view') {
      views[propId] = (views[propId] || 0) + 1;
    }
    if (a.action === 'like' || a.eventType === 'property_like') {
      likes[propId] = (likes[propId] || 0) + 1;
    }
  }

  const topViews = Object.entries(views)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([propertyId, viewsCount]) => ({ _id: propertyId, views: viewsCount }));

  const topLikes = Object.entries(likes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([propertyId, likesCount]) => ({ _id: propertyId, likes: likesCount }));

  return { topViews, topLikes };
}

export async function getUserJourney(days: number = 30): Promise<any[]> { return []; }
export async function getPageVisits(days: number = 30): Promise<any[]> { return []; }
export async function getPageTimeline(days: number = 30): Promise<any[]> { return []; }
export async function getPropertyAnalytics(days: number = 30) { return { propertyViews: [], propertyLikes: [], propertyShares: [] }; }
export async function getUserEngagement(days: number = 30) { return { topUsers: [], avgEngagement: 0, totalActiveUsers: 0 }; }
export async function getConversionFunnel(days: number = 30) { return { visitors: 0, signups: 0, logins: 0, verified: 0, propertyViews: 0, propertyLikes: 0, conversionRates: {} }; }
export async function getUserRegistrationStats(days: number = 30) { return { dailyRegistrations: [], totalUsers: 0 }; }
export async function getEngagementMetrics(days: number = 30) { return { engagement: [], scrollStats: [] }; }
export async function getDeviceAnalytics(days: number = 30) { return { deviceStats: [], screenSizes: [] }; }
export async function getTrafficSources(days: number = 30): Promise<any[]> { return []; }
export async function getSearchAnalytics(days: number = 30): Promise<any[]> { return []; }
export async function getPropertyAnalyticsDetailed(days: number = 30): Promise<any[]> { return []; }
export async function getTimeOnPageAnalytics(days: number = 30): Promise<any[]> { return []; }
export async function getSessionAnalytics(days: number = 30) { return {}; }
export async function getRetentionAnalytics(days: number = 30) { return {}; }
export async function getRealTimeAnalytics() { return { activeUsersNow: 0, lastHourPageViews: 0, lastHourPropertyViews: 0, recentEvents: [], eventsByType: [] }; }
export async function getUserBehaviorMetrics(days: number = 30) { return { clickEvents: [], formEvents: [], dropOffPoints: [] }; }
