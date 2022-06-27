import { Controller, Get } from '@nestjs/common'

@Controller()
export class ChargeRelayServiceController {
  @Get('health')
  healthCheck () {
    return 'ok'
  }
}
