import { Connection } from 'mongoose'
import { OperatorWalletSchema } from '@app/accounts-service/operators/schemas/operator-wallet.schema'
import { operatorInvoiceModelString, operatorCheckoutModelString, operatorRefreshTokenModelString, operatorWalletModelString } from '@app/accounts-service/operators/operators.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { OperatorRefreshTokenSchema } from '@app/accounts-service/operators/schemas/operator-refresh-token.schema'
import { OperatorInvoiceSchema } from '@app/accounts-service/operators/schemas/operator-invoice.schema'
import { OperatorCheckoutSchema } from '@app/accounts-service/operators/schemas/operator-checkout.schema'

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
    provide: operatorInvoiceModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorInvoice', OperatorInvoiceSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: operatorCheckoutModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorCheckout', OperatorCheckoutSchema),
    inject: [databaseConnectionString]
  }
]
