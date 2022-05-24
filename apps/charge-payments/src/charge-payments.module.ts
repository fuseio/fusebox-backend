import { Module } from '@nestjs/common';
import { ChargePaymentsController } from './charge-payments.controller';
import { ChargePaymentsService } from './charge-payments.service';

@Module({
  imports: [],
  controllers: [ChargePaymentsController],
  providers: [ChargePaymentsService],
})
export class ChargePaymentsModule {}
