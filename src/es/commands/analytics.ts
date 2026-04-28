import { createCommands } from 'evtstore';
import type { AnalyticsEvt, AnalyticsAgg, AnalyticsCmd } from '../types/analytics';
import { domain } from '../domain';

export const analyticsCmd = createCommands<AnalyticsEvt, AnalyticsAgg, AnalyticsCmd>(domain.analytics, {
  async record(cmd, agg) {
    if (agg.version > 0) throw new Error('Analytics already recorded');
    return {
      type: 'analyticsRecorded',
      userId: cmd.userId,
      eventType: cmd.eventType,
      metadata: cmd.metadata,
      action: cmd.action,
      sessionId: cmd.sessionId,
      ipAddress: cmd.ipAddress,
      userAgent: cmd.userAgent,
      referrer: cmd.referrer,
      performedBy: cmd.performedBy,
    };
  },
});