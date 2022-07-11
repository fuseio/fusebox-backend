import { Controller, Get } from '@nestjs/common';

@Controller()
export class ChargeNotificationsServiceController {
  @Get('health')
  healthCheck () {
    return 'ok'
  }
}
