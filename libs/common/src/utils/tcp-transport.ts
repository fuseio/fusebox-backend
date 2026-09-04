import { ClientProviderOptions, JsonSocket, TcpOptions, Transport } from '@nestjs/microservices'
import { Socket } from 'net'

/**
 * Nest's TCP transport talks over a bare `net.Socket`, and Node leaves TCP keepalive off.
 *
 * When a peer disappears without a clean FIN/RST — a pod replaced or evicted, a node
 * killed, a conntrack/NAT entry dropped — our side of the socket stays ESTABLISHED
 * forever. No 'error' or 'close' event fires, so `ClientTCP` keeps handing out its cached
 * `connection` promise and `publish()` keeps writing into a socket that will never
 * answer. Every request then hangs until it times out, and the only cure is a restart.
 *
 * With keepalive on, the kernel probes the peer and surfaces ECONNRESET/ETIMEDOUT. That
 * fires 'close', `ClientTCP.handleClose()` drops the cached connection, and the next call
 * dials a fresh socket. The probes also keep NAT/conntrack entries warm while idle.
 */
export const TCP_KEEP_ALIVE_INITIAL_DELAY_MS = 10_000

export class KeepAliveJsonSocket extends JsonSocket {
  constructor (socket: Socket) {
    super(socket)

    // Both are queued until 'connect' when the handle does not exist yet.
    socket.setNoDelay(true)
    socket.setKeepAlive(true, TCP_KEEP_ALIVE_INITIAL_DELAY_MS)
  }
}

function toPort (port: string | number): number {
  return typeof port === 'number' ? port : parseInt(port, 10)
}

/**
 * TCP options for a microservice client. Always prefer this over an inline
 * `{ transport, options }` literal so every client gets keepalive.
 */
export function tcpClient (
  name: string,
  host: string,
  port: string | number
): ClientProviderOptions {
  return {
    name,
    transport: Transport.TCP,
    options: {
      host,
      port: toPort(port),
      socketClass: KeepAliveJsonSocket
    }
  }
}

/**
 * `ServerTCP.handleClose()` re-`listen()`s a closed listener only if `retryAttempts` is
 * set; with no value it returns immediately and the microservice stops accepting TCP
 * forever, silently. Nothing detects that on its own — these apps are hybrids whose HTTP
 * server is a separate listener, so /health keeps answering and Kubernetes sees a healthy
 * pod while every microservice call times out until someone restarts it by hand.
 *
 * These are the options the TCP *server* genuinely supports. They have no client-side
 * equivalent: `TcpClientOptions` accepts only host/port/serializer/deserializer/
 * tlsOptions/socketClass, and a client reconnect is driven by `ClientTCP.handleClose()`
 * clearing its cached connection instead.
 */
const DEFAULT_SERVER_RETRY_ATTEMPTS = 10
const DEFAULT_SERVER_RETRY_DELAY_MS = 3000

/**
 * TCP options for the server side of a microservice, so sockets we accept detect a dead
 * peer too and do not pile up as half-open connections.
 */
export function tcpServer (
  host: string,
  port: string | number,
  extraOptions: Omit<TcpOptions['options'], 'host' | 'port' | 'socketClass'> = {}
): TcpOptions {
  return {
    transport: Transport.TCP,
    options: {
      host,
      port: toPort(port),
      socketClass: KeepAliveJsonSocket,
      retryAttempts: DEFAULT_SERVER_RETRY_ATTEMPTS,
      retryDelay: DEFAULT_SERVER_RETRY_DELAY_MS,
      // A caller's explicit values still win; graceful shutdown is unaffected either way
      // because close() sets isExplicitlyTerminated before the listener closes.
      ...extraOptions
    }
  }
}

/**
 * Outcome of probing the microservice's TCP listener.
 *
 * 'unknown' exists so a health endpoint can never be brought down by the probe itself.
 * A liveness probe that throws restarts the pod in a loop, so this must only ever report
 * a definite 'refused' — positive evidence the listener is gone. A misconfigured port or
 * an unexpected error degrades to 'unknown', which callers treat as healthy: strictly no
 * worse than not checking at all.
 */
export type TcpProbeResult = 'accepting' | 'refused' | 'unknown'

/**
 * Probe whether the microservice's TCP listener is accepting connections.
 *
 * These apps are hybrids: `app.listen()` serves HTTP and `startAllMicroservices()`
 * serves TCP, as two independent listeners in one process. A health endpoint that only
 * proves HTTP is up therefore reports a healthy pod while every microservice call times
 * out, which is why such an outage needs a manual restart to clear. Probing the TCP port
 * from the health handler closes that gap: liveness then restarts the pod and readiness
 * pulls it from the Service, with no extra Kubernetes configuration.
 *
 * Connect-only, so it has no side effects and costs nothing on the handler side. It
 * detects a dead or closed listener, not a handler that accepts and then stalls. Never
 * rejects, by design — see TcpProbeResult.
 */
export function probeTcpPort (port: number, timeoutMs = 500): Promise<TcpProbeResult> {
  // net.connect() throws synchronously on a non-integer or out-of-range port, which for
  // an unset env var (parseInt -> NaN) would otherwise take the health endpoint with it.
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return Promise.resolve('unknown')
  }

  return new Promise<TcpProbeResult>(resolve => {
    let socket: Socket

    const settle = (result: TcpProbeResult) => {
      if (socket) {
        socket.removeAllListeners()
        // Destroying can still surface an error; keep a sink so it cannot go unhandled.
        socket.on('error', () => {})
        socket.destroy()
      }
      resolve(result)
    }

    try {
      socket = new Socket()
      socket.setTimeout(timeoutMs)
      socket.once('connect', () => settle('accepting'))
      socket.once('timeout', () => settle('refused'))
      socket.once('error', () => settle('refused'))
      socket.connect(port, '127.0.0.1')
    } catch {
      settle('unknown')
    }
  })
}
