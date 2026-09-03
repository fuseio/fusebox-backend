import { HttpException, HttpStatus, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom, takeLast, timeout, TimeoutError } from 'rxjs'
import { get } from 'lodash'

const logger = new Logger('MicroserviceClient')

export const MS_CALL_TIMEOUT_MS = 20000
const DEFAULT_RETRIES = 1

export interface CallMSFunctionOptions {
  /** Per-attempt timeout. Raise it for handlers that are legitimately slow. */
  timeoutMs?: number
  /**
   * Extra attempts after a transport failure. Set to 0 for calls that must never be
   * duplicated — a retry is only issued when the connection is known to be gone, but
   * the server may already have processed the request before it dropped.
   */
  retries?: number
}

/**
 * Last moment each client heard anything back from its peer. A response — even an
 * error one — proves the socket is alive, which is what lets us tell a dead socket
 * apart from a handler that is merely slow when a call times out.
 */
const lastResponseAt = new WeakMap<ClientProxy, number>()

/**
 * Failures Nest reports once it has noticed the connection is gone. A response can
 * never arrive on a closed socket, so these are the only errors worth retrying.
 */
const connectionErrors = [
  'Connection closed',
  'The net socket is closed',
  // ClientTCP.publish() dereferences a socket that handleClose() has already nulled
  // when a reset lands mid-flight; it surfaces as a TypeError naming sendMessage.
  "reading 'sendMessage'",
  'ECONNREFUSED',
  'ECONNRESET',
  'EPIPE',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENOTFOUND'
]

function describeClient (client: ClientProxy): string {
  const { host, port } = client as any
  return host ? `${host}:${port}` : 'UnknownService'
}

function isConnectionError (error: any): boolean {
  if (error instanceof TimeoutError) {
    return false
  }

  const code = get(error, 'code')
  const message = `${get(error, 'message', '')} ${get(error, 'error', '')} ${code ?? ''}`

  return connectionErrors.some(candidate => message.includes(candidate))
}

function hasRespondedWithin (client: ClientProxy, windowMs: number): boolean {
  const seen = lastResponseAt.get(client)
  return seen !== undefined && Date.now() - seen < windowMs
}

/**
 * Drop the client's socket so `ClientTCP` clears its cached `connection` and the next
 * send() dials a fresh one. Without this a half-open socket is never recovered and the
 * pod has to be restarted. In-flight requests on this socket are rejected, which is
 * why we only do it once the socket itself is the suspect.
 *
 * The discarded socket has to be detached first. `ClientTCP.bindEvents()` wires its
 * 'close' event to `handleClose()`, and `close()` only calls `socket.end()` — on a
 * half-open socket the FIN is never acknowledged, so that event can land minutes later
 * and would then null out whatever connection has been established since, rejecting a
 * healthy request. Reaching into the private `socket` is the only way to unhook it;
 * Nest exposes no supported alternative.
 */
function resetConnection (client: ClientProxy, serviceName: string): void {
  try {
    const internals = client as any
    const netSocket = internals.socket?.netSocket

    if (netSocket) {
      netSocket.removeAllListeners()
      // A destroyed socket can still emit 'error' (a late ECONNRESET). With every
      // listener gone that would be an unhandled 'error' event, which takes the process
      // down, so keep a sink attached.
      netSocket.on('error', () => {})
      netSocket.destroy()
      internals.socket = null
    }

    // Now safe: handleClose() only does bookkeeping — clears the cached connection and
    // fails the in-flight requests that were stranded on the dead socket.
    client.close()
    logger.warn(`Dropped stale connection to ${serviceName}; next call will reconnect`)
  } catch (err) {
    logger.warn(`Failed to drop stale connection to ${serviceName}: ${get(err, 'message', err)}`)
  }
}

function toHttpException (error: any, serviceName: string, pattern: string): HttpException {
  if (error instanceof TimeoutError) {
    return new HttpException(
      `Timeout in ${serviceName} microservice call`,
      HttpStatus.REQUEST_TIMEOUT
    )
  }

  if (isConnectionError(error)) {
    return new HttpException(
      `Connection to ${serviceName} microservice lost (pattern: ${pattern})`,
      HttpStatus.SERVICE_UNAVAILABLE
    )
  }

  // RpcException errors use 'error' and 'status'; legacy ones use 'message' and 'statusCode'.
  const statusCode = get(error, 'status', get(error, 'statusCode', HttpStatus.INTERNAL_SERVER_ERROR))
  const message = get(error, 'error', get(error, 'message', 'Unknown error'))

  return new HttpException(`Error in ${serviceName} microservice: ${message}`, statusCode)
}

async function sendOnce (
  client: ClientProxy,
  pattern: string,
  data: any,
  timeoutMs: number
): Promise<any> {
  return lastValueFrom(
    client.send(pattern, data).pipe(timeout(timeoutMs), takeLast(1))
  )
}

export async function callMSFunction (
  client: ClientProxy,
  pattern: string,
  data: any,
  options: CallMSFunctionOptions = {}
) {
  const timeoutMs = options.timeoutMs ?? MS_CALL_TIMEOUT_MS
  const retries = options.retries ?? DEFAULT_RETRIES
  const serviceName = describeClient(client)

  for (let attempt = 0; ; attempt++) {
    try {
      const response = await sendOnce(client, pattern, data, timeoutMs)
      lastResponseAt.set(client, Date.now())
      return response
    } catch (error) {
      const timedOut = error instanceof TimeoutError
      const connectionLost = isConnectionError(error)

      if (!timedOut && !connectionLost) {
        // The peer answered, it just answered with an error — the socket is healthy.
        lastResponseAt.set(client, Date.now())
      }

      // A timeout with nothing at all coming back over the whole window points at the
      // socket rather than the handler: a live peer would have served other traffic.
      //
      // On an idle client this cannot discriminate — the only evidence available is the
      // timed-out call itself — so a lone slow handler does drop a healthy socket. That
      // costs one reconnect on the next call and nothing else, precisely because there
      // is no other traffic to strand. Under load, concurrent responses keep the socket
      // provably alive and a slow handler is left alone.
      const staleSocket = timedOut && !hasRespondedWithin(client, timeoutMs)

      logger.error(
        `Error in microservice call to ${serviceName} (pattern: ${pattern}, attempt: ${attempt + 1}): ` +
        `${get(error, 'message', error)}`
      )

      // Only a stale socket needs dropping by hand. Every reachable connection error is
      // reported *by* ClientTCP.handleClose(), which has already discarded the cached
      // connection — closing again there would only risk killing the fresh socket a
      // concurrent retry has just opened.
      if (staleSocket) {
        resetConnection(client, serviceName)
      }

      // Timeouts are not retried: the server may still be working on the request, and a
      // second full timeout would double the caller's wait for no extra chance of success.
      if (connectionLost && attempt < retries) {
        logger.warn(`Retrying ${pattern} on ${serviceName} over a fresh connection`)
        continue
      }

      throw toHttpException(error, serviceName, pattern)
    }
  }
}
