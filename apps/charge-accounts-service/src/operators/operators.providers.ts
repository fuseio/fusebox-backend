import { Connection } from 'mongoose'
import { OperatorWalletSchema } from '@app/accounts-service/operators/schemas/operator-wallet.schema'
import { operatorInvoiceModelString, operatorWalletModelString } from '@app/accounts-service/operators/operators.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { OperatorInvoiceSchema } from '@app/accounts-service/operators/schemas/operator-invoice.schema'

export const operatorsProviders = [
  {
    provide: operatorWalletModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorWallet', OperatorWalletSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: operatorInvoiceModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorInvoice', OperatorInvoiceSchema),
    inject: [databaseConnectionString]
  }
]
