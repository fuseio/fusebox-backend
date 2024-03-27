import { Provider } from '@nestjs/common'
import { CentClient } from 'cent.js'

export const CentrifugeClientProvider: Provider = {
  provide: CentClient,
  useFactory: (): CentClient => new CentClient({
    url: process.env.CENTRIFUGO_API_URL,
    token: process.env.CENTRIFUGO_API_KEY
  })
}
