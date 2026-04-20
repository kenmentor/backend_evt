export type AnalyticsEvt =
  | {
      type: 'analyticsRecorded';
      userId: string;
      eventType: string;
      metadata?: Record<string, unknown>;
      performedBy?: string;
    };

export type AnalyticsAgg = {
  userId: string;
  eventType: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
};

export type AnalyticsCmd =
  | {
      type: 'record';
      userId: string;
      eventType: string;
      metadata?: Record<string, unknown>;
      performedBy?: string;
    };