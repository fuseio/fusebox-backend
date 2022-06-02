import { Module } from '@nestjs/common'
import { DatabaseModule } from '@app/common'
import { RelayAccountsController } from '@app/relay-service/relay-accounts/relay-accounts.controller'
import { RelayAccountsService } from '@app/relay-service/relay-accounts/relay-accounts.service'
import { relayProviders } from '@app/relay-service/relay-accounts/relay-accounts.providers'

@Module({
  imports: [DatabaseModule],
  controllers: [RelayAccountsController],
  providers: [RelayAccountsService, ...relayProviders],
  exports: [RelayAccountsService]
})
export class RelayAccountsModule {}
