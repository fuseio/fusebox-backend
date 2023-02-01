import { Controller, Get } from '@nestjs/common'

@Controller()
export class ChargeSmartWalletsServiceController {
  @Get('health')
  healthCheck () {
    return 'ok'
  }
}
