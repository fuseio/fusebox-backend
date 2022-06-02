import { Module } from '@nestjs/common';
import { ApiKeyModule } from 'apps/charge-api-service/src/api-keys/api-keys.module';
import { ChargeApiServiceController } from '@app/api-service/charge-api-service.controller';
import { ChargeApiServiceService } from '@app/api-service/charge-api-service.service';

@Module({
  imports: [ApiKeyModule],
  controllers: [ChargeApiServiceController],
  providers: [ChargeApiServiceService],
})
export class ChargeApiServiceModule {}
