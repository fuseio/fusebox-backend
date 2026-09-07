import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Model, Types } from 'mongoose'
import { WebhookEvent } from '@app/notifications-service/common/interfaces/webhook-event.interface'
import {
  MAX_RETRY_ATTEMPTS,
  WEBHOOK_EVENT_RETENTION_DAYS,
  webhookEventModelString
} from '@app/notifications-service/common/constants/webhook-event.constants'

/**
 * Paced retention for webhookevents.
 *
 * The collection is a delivery queue that nothing outside this service reads, and it had
 * grown to ~13M documents. Its size is what turned an unindexed lookup into a two-hour
 * collection scan, which saturated MongoDB and starved every other query in the service.
 *
 * Deliberately not a TTL index. A TTL index cannot be throttled: the monitor begins
 * deleting every already-expired document within a minute of the index being created,
 * and one deleteMany over the backlog would emit millions of oplog entries in an
 * unbroken burst. On storage already measuring ~1 MB/s of effective throughput that is
 * enough to push secondaries into replication lag, which surfaces to callers as
 * "not primary and secondaryOk=false". Deleting in small paced batches keeps the cluster
 * usable while the backlog drains, and afterwards this just holds the line.
 */
@Injectable()
export class WebhookEventsCleanupService {
  private readonly logger = new Logger(WebhookEventsCleanupService.name)

  /** Documents per delete. Small enough that no single write is long-running. */
  private readonly BATCH_SIZE = 1000

  /**
   * Ceiling on one run. Both apply and whichever is reached first ends the run.
   *
   * The document cap sizes the drain: at 50k every two hours a ~11.6M backlog clears in
   * roughly three weeks, and once it is gone a run finds only the trickle that aged past
   * the window since the last one. The time cap is what makes that safe — measured
   * locally a batch is single-digit milliseconds, but on contended storage it can be far
   * slower, and the time cap bounds the run regardless of how slow the cluster is.
   */
  private readonly MAX_DOCUMENTS_PER_RUN = 50000
  private readonly MAX_RUN_DURATION_MS = 5 * 60 * 1000

  /**
   * Sleep between batches, as a multiple of how long the batch itself took. Pacing by
   * ratio rather than a fixed delay means this consumes a bounded share of whatever
   * capacity the cluster has instead of a fixed rate that might be far too much for it.
   */
  private readonly PACING_FACTOR = 2
  private readonly MIN_SLEEP_MS = 50
  private readonly MAX_SLEEP_MS = 2000

  /**
   * Guards against a run starting while the previous one is still going, which would
   * double the load rather than pace it. In-process only: this assumes the single
   * notifications replica the deployment runs. With more than one replica each would
   * sweep independently — wasteful but not harmful, since the deletes are keyed by _id
   * and a document already gone simply is not counted twice.
   */
  private isRunning = false

  constructor (
    @Inject(webhookEventModelString)
    private readonly webhookEventModel: Model<WebhookEvent>
  ) { }

  @Cron(CronExpression.EVERY_2_HOURS)
  async purgeExpiredEvents (): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Previous cleanup run is still in progress, skipping this one')
      return
    }

    this.isRunning = true
    try {
      await this.purge()
    } catch (error) {
      this.logger.error(`Webhook event cleanup failed: ${error?.message ?? error}`)
    } finally {
      this.isRunning = false
    }
  }

  private async purge (): Promise<void> {
    const startedAt = Date.now()
    const cutoffDate = new Date(Date.now() - WEBHOOK_EVENT_RETENTION_DAYS * 86400 * 1000)

    // An ObjectId's leading four bytes are its creation time, so bounding _id bounds the
    // scan by age using the index every collection already has. No extra index, and the
    // last _id of a batch is where the next one resumes.
    const cutoffId = Types.ObjectId.createFromTime(Math.floor(cutoffDate.getTime() / 1000))

    let lastId = new Types.ObjectId('000000000000000000000000')
    let deleted = 0
    let batches = 0

    for (;;) {
      if (deleted >= this.MAX_DOCUMENTS_PER_RUN) break
      if (Date.now() - startedAt >= this.MAX_RUN_DURATION_MS) {
        this.logger.log(`Cleanup hit its ${this.MAX_RUN_DURATION_MS / 1000}s budget; the rest waits for the next run`)
        break
      }

      const limit = Math.min(this.BATCH_SIZE, this.MAX_DOCUMENTS_PER_RUN - deleted)

      // Only finished events are eligible: delivered, or out of retries. Anything the
      // broadcaster might still send is never touched, however old it is.
      const candidates = await this.webhookEventModel
        .find(
          {
            _id: { $gt: lastId, $lt: cutoffId },
            $or: [
              { success: true },
              { numberOfTries: { $gte: MAX_RETRY_ATTEMPTS } }
            ]
          },
          { _id: 1 }
        )
        .sort({ _id: 1 })
        .limit(limit)
        .lean()

      if (candidates.length === 0) break

      const ids = candidates.map(doc => doc._id)
      const batchStartedAt = Date.now()
      const result = await this.webhookEventModel.deleteMany({ _id: { $in: ids } })
      const batchMs = Date.now() - batchStartedAt

      // Advance past the batch we just examined, not just the rows we deleted. Ineligible
      // documents in the gap are skipped rather than re-read, and progress is strictly
      // monotonic so the loop always terminates.
      lastId = ids[ids.length - 1] as Types.ObjectId
      deleted += result.deletedCount
      batches++

      await this.sleep(
        Math.min(
          Math.max(batchMs * this.PACING_FACTOR, this.MIN_SLEEP_MS),
          this.MAX_SLEEP_MS
        )
      )
    }

    if (deleted > 0) {
      this.logger.log(
        `Cleaned up ${deleted} webhook events older than ${WEBHOOK_EVENT_RETENTION_DAYS} days ` +
        `in ${batches} batches over ${((Date.now() - startedAt) / 1000).toFixed(1)}s`
      )
    } else {
      this.logger.log('No webhook events were due for cleanup')
    }
  }

  private sleep (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
