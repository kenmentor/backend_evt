import { createAggregate } from 'evtstore';
import type { AnalyticsEvt, AnalyticsAgg } from '../types/analytics';

export const analyticsAgg = createAggregate<AnalyticsEvt, AnalyticsAgg, 'analytics'>({
  stream: 'analytics',
  create: (): AnalyticsAgg => ({
    userId: '',
    eventType: '',
    timestamp: new Date(),
    metadata: {},
    action: undefined,
    sessionId: undefined,
    ipAddress: undefined,
    userAgent: undefined,
    referrer: undefined,
  }),
  fold: (evt, prev): AnalyticsAgg => {
    switch (evt.type) {
      case 'analyticsRecorded':
        return {
          ...prev,
          userId: evt.userId,
          eventType: evt.eventType,
          timestamp: new Date(),
          metadata: evt.metadata || {},
          action: evt.action,
          sessionId: evt.sessionId,
          ipAddress: evt.ipAddress,
          userAgent: evt.userAgent,
          referrer: evt.referrer,
        };

      default:
        return prev;
    }
  },
});