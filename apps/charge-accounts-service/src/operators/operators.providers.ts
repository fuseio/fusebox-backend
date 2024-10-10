import { Connection } from 'mongoose'
import { OperatorWalletSchema } from '@app/accounts-service/operators/schemas/operator-wallet.schema'
import { operatorRefreshTokenModelString, operatorWalletModelString } from '@app/accounts-service/operators/operators.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { OperatorRefreshTokenSchema } from '@app/accounts-service/operators/schemas/operator-refresh-token.schema'

export const operatorsProviders = [
  {
    provide: operatorWalletModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorWallet', OperatorWalletSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: operatorRefreshTokenModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorRefreshToken', OperatorRefreshTokenSchema),
    inject: [databaseConnectionString]
  }
]
