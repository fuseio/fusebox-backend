import { Connection } from 'mongoose'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { userOpString } from '@app/smart-wallets-service/data-layer/data-layer.constants'
import { UserOpSchema } from '@app/smart-wallets-service/data-layer/schemas/user-op.schema'
import { walletActionString } from '@app/smart-wallets-service/data-layer/data-layer.constants'
import { WalletActionSchema } from './schemas/wallet-action.schema'
// const mongoose = require('mongoose')
// const WalletAction = mongoose.model('WalletAction')

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
      connection.model('WalletAction', WalletActionSchema),
    inject: [databaseConnectionString]
  }
]
