import { Connection } from 'mongoose'
import { OperatorWalletSchema } from '@app/accounts-service/operators/schemas/operator-wallet.schema'
import { invoicesModelString, operatorRefreshTokenModelString, operatorWalletModelString } from '@app/accounts-service/operators/operators.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { OperatorRefreshTokenSchema } from '@app/accounts-service/operators/schemas/operator-refresh-token.schema'
import { InvoiceSchema } from '@app/accounts-service/operators/schemas/invoice.schema'

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
  },
  {
    provide: invoicesModelString,
    useFactory: (connection: Connection) =>
      connection.model('Invoice', InvoiceSchema),
    inject: [databaseConnectionString]
  }
]
