import { Connection } from 'mongoose'
import { OperatorWalletSchema } from '@app/accounts-service/operators/schemas/operator-wallet.schema'
import { operatorWalletModelString } from '@app/accounts-service/operators/operators.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'

export const operatorsProviders = [
  {
    provide: operatorWalletModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorWallet', OperatorWalletSchema),
    inject: [databaseConnectionString]
  }
]
