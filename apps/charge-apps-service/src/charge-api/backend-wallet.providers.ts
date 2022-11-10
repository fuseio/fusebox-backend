import { Connection } from 'mongoose'
import { backendWalletModelString } from '@app/apps-service/charge-api/backend-wallet.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { BackendWalletSchema } from '@app/apps-service/charge-api/schemas/backend-wallet.schema'

export const backendWalletProviders = [
  {
    provide: backendWalletModelString,
    useFactory: (connection: Connection) =>
      connection.model('BackendWallet', BackendWalletSchema),
    inject: [databaseConnectionString]
  }
]
