import { Connection } from 'mongoose'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { smartAccountString, smartAccountUpgradeString } from '@app/smart-accounts-service/smart-accounts/smart-accounts.constants'
import { SmartAccountSchema } from '@app/smart-accounts-service/smart-accounts/schemas/smart-account.schema'
import { SmartAccountUpgradeSchema } from '@app/smart-accounts-service/smart-accounts/schemas/smart-account-upgrade.schema'

export const smartAccountsProviders = [
  {
    provide: smartAccountString,
    useFactory: (connection: Connection) =>
      connection.model('SmartAccount', SmartAccountSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: smartAccountUpgradeString,
    useFactory: (connection: Connection) =>
      connection.model('SmartAccountUpgrade', SmartAccountUpgradeSchema),
    inject: [databaseConnectionString]
  }
]
