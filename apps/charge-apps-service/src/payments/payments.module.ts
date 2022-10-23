import { DatabaseModule } from '@app/common'
import { Module } from '@nestjs/common'
import { ChargeApiModule } from '@app/apps-service/charge-api/charge-api.module'
import { PaymentsController } from '@app/apps-service/payments/payments.controller'
import { PaymentsService } from '@app/apps-service/payments/payments.service'
import { paymentsProviders } from '@app/apps-service/payments/payments.providers'
import configuration from '@app/apps-service/common/config/configuration'
import { ConfigModule } from '@nestjs/config'
import { ApiKeysModule } from '@app/apps-service/api-keys/api-keys.module'

@Module({
  imports: [ChargeApiModule, DatabaseModule, ConfigModule.forFeature(configuration), ApiKeysModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ...paymentsProviders]
})
export class PaymentsModule {}
