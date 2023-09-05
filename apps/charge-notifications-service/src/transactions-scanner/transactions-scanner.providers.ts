import { databaseConnectionString } from '@app/common/constants/database.constants'
import { transactionsScannerStatusModelString, transactionsScannerStatusServiceString } from '@app/notifications-service/transactions-scanner/transactions-scanner.constants'
import { ScannerStatusSchema } from '@app/notifications-service/common/schemas/scanner-status.schema'
import { Connection } from 'mongoose'
import { ScannerStatusService } from '../common/scanner-status.service';

export const transactionsScannerProviders = [
  {
    provide: transactionsScannerStatusModelString,
    useFactory: (connection: Connection) =>
      connection.model('TransactionsScannerStatus', ScannerStatusSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: transactionsScannerStatusServiceString,
    useFactory: (connection: Connection) =>
      new ScannerStatusService(connection.model('TransactionsScannerStatus', ScannerStatusSchema), 'transactions'),
    inject: [databaseConnectionString]
  }
]
