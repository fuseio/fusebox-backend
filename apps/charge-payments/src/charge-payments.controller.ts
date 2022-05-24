import { Controller, Get } from '@nestjs/common';
import { ChargePaymentsService } from './charge-payments.service';

@Controller()
export class ChargePaymentsController {
  constructor(private readonly chargePaymentsService: ChargePaymentsService) {}

  @Get()
  getHello(): string {
    return this.chargePaymentsService.getHello();
  }
}
