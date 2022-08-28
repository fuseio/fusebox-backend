import { Controller, Get } from '@nestjs/common'

@Controller()
export class ChargeNetworkServiceController {
  @Get('health')
  healthCheck () {
    return 'ok'
  }
}
