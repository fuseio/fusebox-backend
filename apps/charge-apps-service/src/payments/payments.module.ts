import { DatabaseModule } from '@app/common'
import { Module } from '@nestjs/common'
import { ChargeApiModule } from '@app/apps-service/charge-api/charge-api.module'
import { PaymentsController } from '@app/apps-service/payments/payments.controller'
import { PaymentsService } from '@app/apps-service/payments/payments.service'
import { paymentsProviders } from '@app/apps-service/payments/payments.providers'

@Module({
  imports: [ChargeApiModule, DatabaseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ...paymentsProviders]
})
export class PaymentsModule {}
