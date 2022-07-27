import { databaseConnectionString } from '@app/common/constants/database.constants'
import { transactionsScannerStatusModelString } from '@app/notifications-service/transactions-scanner/transactions-scanner.constants'
import { TransactionsScannerStatusSchema } from '@app/notifications-service/transactions-scanner/schemas/transactions-scanner-status.schema'
import { Connection } from 'mongoose'

export const transactionsScannerProviders = [
  {
    provide: transactionsScannerStatusModelString,
    useFactory: (connection: Connection) =>
      connection.model('TransactionsScannerStatus', TransactionsScannerStatusSchema),
    inject: [databaseConnectionString]
  }
]
