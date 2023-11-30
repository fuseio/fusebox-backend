import { Connection, PaginateModel } from 'mongoose'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { userOpString, walletActionString } from '@app/smart-wallets-service/data-layer/data-layer.constants'
import { UserOpSchema } from '@app/smart-wallets-service/data-layer/schemas/user-op.schema'
import { WalletActionSchema, WalletActionDocument } from '@app/smart-wallets-service/data-layer/schemas/wallet-action.schema'
import { SmartWalletSchema } from '@app/smart-wallets-service/smart-wallets/schemas/smart-wallet.schema'
import { smartWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'

export const dataLayerProviders = [
  {
    provide: smartWalletString,
    useFactory: (connection: Connection) =>
      connection.model('SmartWallet', SmartWalletSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: userOpString,
    useFactory: (connection: Connection) =>
      connection.model('UserOp', UserOpSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: walletActionString,
    useFactory: (connection: Connection) =>
      connection.model<
        WalletActionDocument,
        PaginateModel<WalletActionDocument>
      >('walletaction', WalletActionSchema, 'walletaction'),
    inject: [databaseConnectionString]
  }
]
