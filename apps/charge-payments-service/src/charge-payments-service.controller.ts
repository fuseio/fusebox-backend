import { Controller, Get } from '@nestjs/common';
import { ChargePaymentsServiceService } from '@app/payments-service/charge-payments-service.service';

@Controller()
export class ChargePaymentsServiceController {
  constructor(
    private readonly chargePaymentsServiceService: ChargePaymentsServiceService,
  ) { }

  @Get()
  getHello(): string {
    return this.chargePaymentsServiceService.getHello();
  }
}
