import { Controller, Get } from '@nestjs/common';

@Controller()
export class ChargeAppsServiceController {
  @Get('health')
  healthCheck () {
    return 'ok'
  }
}
