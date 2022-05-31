import { Module } from '@nestjs/common';
import { ApiKeyModule } from '@app/payments-service/api-keys/api-keys.module';
import { ChargePaymentsServiceController } from '@app/payments-service/charge-payments-service.controller';
import { ChargePaymentsServiceService } from '@app/payments-service/charge-payments-service.service';

@Module({
  imports: [ApiKeyModule],
  controllers: [ChargePaymentsServiceController],
  providers: [ChargePaymentsServiceService],
})
export class ChargePaymentsServiceModule { }
