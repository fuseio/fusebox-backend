import { Controller, Get } from '@nestjs/common'

@Controller()
export class ChargeDeFiServiceController {
  @Get('health')
  healthCheck () {
    return 'ok'
  }
}
