/*
 * Paced purge of stale webhookevents. Run with mongosh, not node:
 *
 *   mongosh "$MONGO_URI" --file scripts/purge-webhook-events.js
 *
 * Why not deleteMany, and why not let the TTL index do it
 * -------------------------------------------------------
 * A single deleteMany({ createdAt: { $lt: cutoff } }) over ~13M documents scans the
 * whole collection, writes one oplog entry per deleted document in an unbroken burst,
 * and gives you no way to stop or resume it. On storage that is already measuring
 * ~1 MB/s of effective read throughput that is enough to push secondaries into
 * replication lag, which is what surfaces as "not primary and secondaryOk=false".
 *
 * A TTL index has the same problem for the initial purge: the TTL monitor starts
 * deleting everything already past the cutoff within 60 seconds of the index being
 * built, and there is no throttle. Purge first with this script, then add the TTL to
 * hold the line going forward.
 *
 * How this stays out of the way
 * -----------------------------
 *  - Batches are found by an _id range. ObjectId embeds its creation time, so the
 *    always-present _id index gives a time-ordered range scan with no new index, and
 *    the last _id of each batch is a natural resume point.
 *  - Deletes go out as majority writes. That is deliberate backpressure: a batch cannot
 *    return until a majority of the set has it, so the script cannot outrun replication.
 *  - Between batches it sleeps in proportion to how long the batch took, so it consumes
 *    a bounded share of whatever capacity the cluster has rather than a fixed rate that
 *    might be far too much.
 *  - Replication lag is checked every batch and the script pauses while it is high.
 *  - Only delivered or fully-exhausted events are eligible. Anything still awaiting a
 *    retry is never deleted, however old it is - the same rule the TTL index uses.
 *
 * Start with DRY_RUN = true. It walks the identical batches and reports what it would
 * delete without writing anything.
 */

/* eslint-disable no-undef */

const CONFIG = {
  dbName: 'charge-notifications',
  collName: 'webhookevents',

  // Must exceed the broadcaster's worst-case retry horizon (15s + 1m + 10m + 1h + 1d
  // + 1d, about 2.05 days). Kept equal to the TTL so the two agree.
  retentionDays: 30,

  // Attempts the broadcaster makes before giving up. Must match MAX_RETRY_ATTEMPTS in
  // apps/charge-notifications-service/src/common/constants/webhook-event.constants.ts;
  // too low here would delete events that are still going to be retried.
  maxRetryAttempts: 6,

  // Documents per batch. Small enough that one batch is never a long-running write.
  batchSize: 1000,

  // Sleep = batchDuration * pacingFactor. 2 means roughly a third of the time is spent
  // deleting and two thirds idle. Raise it to tread more lightly, lower to go faster.
  pacingFactor: 2,
  minSleepMs: 100,
  maxSleepMs: 5000,

  // Pause while any secondary is behind by more than this.
  maxReplicationLagSeconds: 10,
  lagBackoffMs: 5000,

  // Safety valve so a batch cannot hang forever behind a stalled majority.
  writeTimeoutMs: 30000,

  // Set false only once a dry run looks right.
  dryRun: true,

  // Paste the "resume after" id from a previous run to continue where it stopped.
  resumeAfterId: null,

  // 0 means run to completion.
  maxDocumentsToDelete: 0,
  maxRuntimeMinutes: 0
}

function sleepMs (ms) {
  if (ms > 0) sleep(ms)
}

function fmt (n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Largest lag between the primary and any secondary, in seconds.
 * Returns null when rs.status() is not permitted (shared tiers, standalone) so the
 * caller can carry on without the check rather than aborting.
 */
function replicationLagSeconds () {
  try {
    const status = rs.status()
    const primary = status.members.find(m => m.stateStr === 'PRIMARY')
    const secondaries = status.members.filter(m => m.stateStr === 'SECONDARY')
    if (!primary || secondaries.length === 0) return 0

    let worst = 0
    for (const s of secondaries) {
      const lag = (primary.optimeDate - s.optimeDate) / 1000
      if (lag > worst) worst = lag
    }
    return worst
  } catch (e) {
    return null
  }
}

function waitForReplication () {
  for (;;) {
    const lag = replicationLagSeconds()
    if (lag === null || lag <= CONFIG.maxReplicationLagSeconds) return lag
    print(`    replication lag ${lag.toFixed(1)}s exceeds ${CONFIG.maxReplicationLagSeconds}s - pausing ${CONFIG.lagBackoffMs}ms`)
    sleepMs(CONFIG.lagBackoffMs)
  }
}

function main () {
  const db = globalThis.db.getSiblingDB(CONFIG.dbName)
  const coll = db.getCollection(CONFIG.collName)

  const cutoffDate = new Date(Date.now() - CONFIG.retentionDays * 86400 * 1000)
  // ObjectId's leading 4 bytes are a unix timestamp, so this bounds the scan by time
  // using only the _id index.
  const cutoffId = ObjectId.createFromTime(Math.floor(cutoffDate.getTime() / 1000))

  // Only delivered or fully-exhausted events. Never one still awaiting a retry.
  const eligible = {
    $or: [
      { success: true },
      { numberOfTries: { $gte: CONFIG.maxRetryAttempts } }
    ]
  }

  print('')
  print(`purge ${CONFIG.dbName}.${CONFIG.collName}`)
  print(`  mode              ${CONFIG.dryRun ? 'DRY RUN - nothing will be deleted' : 'LIVE - deleting'}`)
  print(`  retention         ${CONFIG.retentionDays} days (cutoff ${cutoffDate.toISOString()})`)
  print(`  eligible          success:true OR numberOfTries >= ${CONFIG.maxRetryAttempts}`)
  print(`  batch size        ${CONFIG.batchSize}`)
  print(`  pacing            sleep = batch duration x ${CONFIG.pacingFactor}`)
  print(`  collection size   ~${fmt(coll.estimatedDocumentCount())} documents`)
  const startingLag = replicationLagSeconds()
  print(`  replication lag   ${startingLag === null ? 'unavailable (no rs.status permission)' : startingLag.toFixed(1) + 's'}`)
  if (CONFIG.resumeAfterId) print(`  resuming after    ${CONFIG.resumeAfterId}`)
  print('')

  let lastId = CONFIG.resumeAfterId
    ? ObjectId(CONFIG.resumeAfterId)
    : ObjectId('000000000000000000000000')

  let processed = 0
  let batches = 0
  let skipped = 0
  const startedAt = Date.now()

  for (;;) {
    if (CONFIG.maxDocumentsToDelete && processed >= CONFIG.maxDocumentsToDelete) {
      print(`  stopping: reached maxDocumentsToDelete (${CONFIG.maxDocumentsToDelete})`)
      break
    }
    if (CONFIG.maxRuntimeMinutes && (Date.now() - startedAt) / 60000 >= CONFIG.maxRuntimeMinutes) {
      print(`  stopping: reached maxRuntimeMinutes (${CONFIG.maxRuntimeMinutes})`)
      break
    }

    const remaining = CONFIG.maxDocumentsToDelete
      ? Math.min(CONFIG.batchSize, CONFIG.maxDocumentsToDelete - processed)
      : CONFIG.batchSize

    // Ask only for _id: the batch stays small on the wire no matter how fat the
    // documents are.
    const ids = coll.find(
      Object.assign({ _id: { $gt: lastId, $lt: cutoffId } }, eligible),
      { _id: 1 }
    ).sort({ _id: 1 }).limit(remaining).toArray().map(d => d._id)

    if (ids.length === 0) {
      print('  no more eligible documents')
      break
    }

    const batchStartedAt = Date.now()
    let deletedCount = 0

    if (CONFIG.dryRun) {
      deletedCount = ids.length
    } else {
      const res = coll.deleteMany(
        { _id: { $in: ids } },
        { writeConcern: { w: 'majority', wtimeout: CONFIG.writeTimeoutMs } }
      )
      deletedCount = res.deletedCount
      if (deletedCount !== ids.length) {
        // Someone else removed them, or the majority write timed out partway.
        skipped += ids.length - deletedCount
      }
    }

    // Advance past this batch. Ineligible documents in the gap are simply never
    // revisited, which is what we want, and progress is strictly monotonic so the
    // loop always terminates.
    lastId = ids[ids.length - 1]
    processed += deletedCount
    batches++

    const batchMs = Date.now() - batchStartedAt
    const lag = waitForReplication()

    if (batches % 10 === 1 || CONFIG.dryRun) {
      const rate = processed / Math.max((Date.now() - startedAt) / 1000, 0.001)
      print(`  batch ${String(batches).padStart(5)}  ${CONFIG.dryRun ? 'would delete' : 'deleted'} ${fmt(processed)}  ${batchMs}ms/batch  ${rate.toFixed(0)}/s` +
        (lag === null ? '' : `  lag ${lag.toFixed(1)}s`) +
        `  resume after ${lastId}`)
    }

    const sleepFor = Math.min(
      Math.max(Math.round(batchMs * CONFIG.pacingFactor), CONFIG.minSleepMs),
      CONFIG.maxSleepMs
    )
    sleepMs(sleepFor)
  }

  const elapsedSec = (Date.now() - startedAt) / 1000
  print('')
  print(`done: ${CONFIG.dryRun ? 'would have deleted' : 'deleted'} ${fmt(processed)} documents in ${batches} batches over ${elapsedSec.toFixed(0)}s`)
  if (skipped) print(`      ${fmt(skipped)} documents were already gone or timed out`)
  print(`      remaining in collection: ~${fmt(coll.estimatedDocumentCount())}`)
  print(`      resume after: ${lastId}`)
  if (CONFIG.dryRun) print('')
  if (CONFIG.dryRun) print('set CONFIG.dryRun = false to perform the deletion')
  print('')
}

main()
