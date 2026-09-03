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
      ...extraOptions
    }
  }
}
