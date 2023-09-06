import { Connection } from 'mongoose'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { userOpString, walletActionString } from '@app/smart-wallets-service/data-layer/data-layer.constants'
import { UserOpSchema } from '@app/smart-wallets-service/data-layer/schemas/user-op.schema'
import { WalletActionSchema, WalletActionDocument } from '@app/smart-wallets-service/data-layer/schemas/wallet-action.schema'
import * as mongoose from 'mongoose'

export const dataLayerProviders = [
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
        mongoose.PaginateModel<WalletActionDocument>
      >('walletaction', WalletActionSchema, 'walletaction'),
    inject: [databaseConnectionString]
  }
]
