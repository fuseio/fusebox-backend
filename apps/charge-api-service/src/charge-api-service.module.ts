import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { BalancesAPIModule } from '@app/api-service/balances-api/balances-api.module'
import { BundlerApiModule } from '@app/api-service/bundler-api/bundler-api.module'
import { ChargeApiServiceController } from '@app/api-service/charge-api-service.controller'
import { ChargeApiServiceService } from '@app/api-service/charge-api-service.service'
import { ConsensusApiModule } from '@app/api-service/consensus-api/consensus-api.module'
import { ExplorerApiModule } from '@app/api-service/explorer-api/explorer-api.module'
import { GraphqlAPIModule } from '@app/api-service/graphql-api/graphql-api.module'
import { LegacyApiModule } from '@app/api-service/legacy-api/legacy-api.module'
import { Module } from '@nestjs/common'
import { NotificationsModule } from '@app/api-service/notifications/notifications.module'
import { PaymasterApiModule } from '@app/api-service/paymaster-api/paymaster-api.module'
import { SmartWalletsAPIModule } from '@app/api-service/smart-wallets-api/smart-wallets-api.module'
import { StakingAPIModule } from '@app/api-service/staking-api/staking-api.module'
import { TradeApiModule } from '@app/api-service/trade-api/trade-api.module'

@Module({
  imports: [
    ApiKeyModule,
    LegacyApiModule,
    NotificationsModule,
    StakingAPIModule,
    ExplorerApiModule,
    BundlerApiModule,
    SmartWalletsAPIModule,
    GraphqlAPIModule,
    PaymasterApiModule,
    ConsensusApiModule,
    BalancesAPIModule,
    TradeApiModule
  ],
  controllers: [ChargeApiServiceController],
  providers: [ChargeApiServiceService]
})
export class ChargeApiServiceModule { }
