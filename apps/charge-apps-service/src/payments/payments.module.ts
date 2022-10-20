import { DatabaseModule } from '@app/common'
import { Module } from '@nestjs/common'
import { BackendWalletModule } from '@app/apps-service/backend-wallet/backend-wallet.module'
import { PaymentsController } from '@app/apps-service/payments/payments.controller'
import { PaymentsService } from '@app/apps-service/payments/payments.service'
import { paymentsProviders } from '@app/apps-service/payments/payments.providers'

@Module({
  imports: [BackendWalletModule, DatabaseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ...paymentsProviders]
})
export class PaymentsModule {}
