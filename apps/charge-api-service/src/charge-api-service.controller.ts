import { Controller, Get } from '@nestjs/common'

@Controller()
export class ChargeApiServiceController {
  @Get('health')
  healthCheck () {
    return 'ok'
  }
}
