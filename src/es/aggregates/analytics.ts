import { createAggregate } from 'evtstore';
import type { AnalyticsEvt, AnalyticsAgg } from '../types/analytics';

export const analyticsAgg = createAggregate<AnalyticsEvt, AnalyticsAgg, 'analytics'>({
  stream: 'analytics',
  create: (): AnalyticsAgg => ({
    userId: '',
    eventType: '',
    timestamp: new Date(),
    metadata: {},
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
        };

      default:
        return prev;
    }
  },
});