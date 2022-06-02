import { Module } from '@nestjs/common'
import { RelayAccountsModule } from '@app/relay-service/relay-accounts/relay-accounts.module'

@Module({
  imports: [RelayAccountsModule]
})
export class ChargeRelayServiceModule {}
