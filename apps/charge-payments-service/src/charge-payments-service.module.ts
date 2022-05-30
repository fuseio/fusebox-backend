import { Module } from '@nestjs/common';
import { ApiKeyModule } from './api-keys/api-keys.module';
import { ChargePaymentsServiceController } from './charge-payments-service.controller';
import { ChargePaymentsServiceService } from './charge-payments-service.service';

@Module({
  imports: [ApiKeyModule],
  controllers: [ChargePaymentsServiceController],
  providers: [ChargePaymentsServiceService],
})
export class ChargePaymentsServiceModule {}
