export type AnalyticsEvt =
  | {
      type: 'analyticsRecorded';
      userId: string;
      eventType: string;
      metadata?: Record<string, unknown>;
      action?: string;
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
      referrer?: string;
      performedBy?: string;
    };

export type AnalyticsAgg = {
  userId: string;
  eventType: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
  action?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
};

export type AnalyticsCmd =
  | {
      type: 'record';
      userId: string;
      eventType: string;
      metadata?: Record<string, unknown>;
      action?: string;
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
      referrer?: string;
      performedBy?: string;
    };