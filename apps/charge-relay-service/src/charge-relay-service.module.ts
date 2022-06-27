import { Module } from '@nestjs/common'
import { RelayAccountsModule } from '@app/relay-service/relay-accounts/relay-accounts.module'
import { ChargeRelayServiceController } from './charge-relay-service.controller'

@Module({
  imports: [RelayAccountsModule],
  controllers: [ChargeRelayServiceController]
})
export class ChargeRelayServiceModule {}
