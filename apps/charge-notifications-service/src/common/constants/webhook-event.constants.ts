export const webhookEventModelString = 'WEBHOOK_EVENT_MODEL'

/**
 * Attempts the broadcaster makes before it gives up on an event.
 *
 * Shared because the retention TTL keys off it: an event is only safe to expire once it
 * is delivered or has exhausted these attempts. If the two ever drifted apart, retention
 * would start deleting events that were still waiting to be retried.
 */
export const MAX_RETRY_ATTEMPTS = 6

/**
 * How long a finished webhook event is kept.
 *
 * Must exceed the broadcaster's worst-case retry horizon (15s + 1m + 10m + 1h + 1d + 1d,
 * about 2.05 days) by a wide margin, since a long outage is exactly when events sit
 * undelivered longest.
 *
 * Enforced by WebhookEventsCleanupService rather than a TTL index. A TTL index cannot be
 * throttled: the monitor would start deleting every already-expired document within a
 * minute of the index being built, which on this cluster's storage is precisely the
 * delete storm worth avoiding.
 */
export const WEBHOOK_EVENT_RETENTION_DAYS = 30
