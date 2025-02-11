import { Connection } from 'mongoose'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { smartWalletString, smartWalletUpgradeString, smartContractWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'
import { SmartWalletSchema } from '@app/smart-wallets-service/smart-wallets/schemas/smart-wallet.schema'
import { SmartWalletUpgradeSchema } from '@app/smart-wallets-service/smart-wallets/schemas/smart-wallet-upgrade.schema'
import { SmartContractWalletSchema } from '@app/smart-wallets-service/smart-wallets/schemas/smart-contract-wallet.schema'

export const smartWalletsProviders = [
  {
    provide: smartWalletString,
    useFactory: (connection: Connection) =>
      connection.model('SmartWallet', SmartWalletSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: smartWalletUpgradeString,
    useFactory: (connection: Connection) =>
      connection.model('SmartWalletUpgrade', SmartWalletUpgradeSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: smartContractWalletString,
    useFactory: (connection: Connection) =>
      connection.model('SmartContractWallet', SmartContractWalletSchema),
    inject: [databaseConnectionString]
  }
]
