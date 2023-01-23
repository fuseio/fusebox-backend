import { Controller, Get } from '@nestjs/common';

@Controller()
export class ChargeSmartAccountsServiceController {
  @Get('health')
  healthCheck () {
    return 'ok'
  }
}
