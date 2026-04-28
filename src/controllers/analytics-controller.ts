import { Request, Response } from "express";
import { analytics_service } from "../service";
import { response } from "../utility";
const { goodResponse, badResponse } = response;

async function trackEvent(req: Request, res: Response) {
  try {
    const data = req.body;
    const event = await analytics_service.trackEvent(data);
    return res.json(goodResponse(event, "Event tracked"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function trackBatchEvents(req: Request, res: Response) {
  try {
    const { events } = req.body;
    const result = await analytics_service.trackBatchEvents(events);
    return res.json(goodResponse(result, "Events tracked"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getOverview(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getAnalyticsOverview(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getTopProperties(req: Request, res: Response) {
  try {
    const { days, limit } = req.query;
    const data = await analytics_service.getTopProperties(parseInt(days as string) || 30, parseInt(limit as string) || 10);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getUserJourney(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getUserJourney(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getPageVisits(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getPageVisits(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getUserRegistrationStats(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getUserRegistrationStats(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getPageTimeline(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getPageTimeline(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getPropertyAnalytics(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getPropertyAnalytics(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getUserEngagement(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getUserEngagement(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getConversionFunnel(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getConversionFunnel(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getEngagementMetrics(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getEngagementMetrics(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getDeviceAnalytics(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getDeviceAnalytics(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getTrafficSources(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getTrafficSources(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getSearchAnalytics(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getSearchAnalytics(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getPropertyAnalyticsDetailed(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getPropertyAnalyticsDetailed(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getTimeOnPageAnalytics(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getTimeOnPageAnalytics(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getSessionAnalytics(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getSessionAnalytics(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getRetentionAnalytics(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getRetentionAnalytics(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getRealTimeAnalytics(req: Request, res: Response) {
  try {
    const data = await analytics_service.getRealTimeAnalytics();
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function getUserBehaviorMetrics(req: Request, res: Response) {
  try {
    const { days } = req.query;
    const data = await analytics_service.getUserBehaviorMetrics(parseInt(days as string) || 30);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

export {
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
