import { Centrifuge } from 'centrifuge'
import { WebSocket } from 'ws'
import { Provider } from '@nestjs/common'

export const CentrifugeProvider: Provider = {
  provide: Centrifuge,
  useFactory: (): Centrifuge => new Centrifuge(process.env.CENTRIFUGO_URI, {
    debug: true,
    websocket: WebSocket,
    name: 'charge-backend',
    token: process.env.CENTRIFUGO_JWT
  })
}
