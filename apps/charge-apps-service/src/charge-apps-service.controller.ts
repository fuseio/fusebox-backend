import { Controller, Get } from '@nestjs/common';
import { ChargeAppsServiceService } from './charge-apps-service.service';

@Controller()
export class ChargeAppsServiceController {
  constructor(private readonly chargeAppsServiceService: ChargeAppsServiceService) {}

  @Get()
  getHello(): string {
    return this.chargeAppsServiceService.getHello();
  }
}
