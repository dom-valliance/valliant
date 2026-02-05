export * from './definitions/event-types.js';
export * from './publishers/event-publisher.js';
export * from './subscribers/event-subscriber.js';

// Queue names for BullMQ
export enum QueueName {
  REPORT_GENERATION = 'report-generation',
  AI_PROCESSING = 'ai-processing',
  NOTIFICATION = 'notification',
  DATA_EXPORT = 'data-export',
  AUDIT_LOG = 'audit-log',
  TIMESHEET_LOCK = 'timesheet-lock',
  BUDGET_CHECK = 'budget-check',
}
