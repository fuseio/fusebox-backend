import { Controller, Get } from '@nestjs/common';
import { ChargeRelayServiceService } from '@app/relay-service/charge-relay-service.service';

@Controller()
export class ChargeRelayServiceController {
  constructor(
    private readonly chargeRelayServiceService: ChargeRelayServiceService,
  ) {}

  @Get()
  getHello(): string {
    return this.chargeRelayServiceService.getHello();
  }
}
