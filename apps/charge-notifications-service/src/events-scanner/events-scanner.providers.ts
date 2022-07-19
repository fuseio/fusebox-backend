import { databaseConnectionString } from '@app/common/constants/database.constants'
import { eventsScannerStatusModelString } from '@app/notifications-service/events-scanner/events-scanner.constants'
import { EventsScannerStatusSchema } from '@app/notifications-service/events-scanner/schemas/events-scanner-status.schema'
import { Connection } from 'mongoose'

export const eventsScannerProviders = [
  {
    provide: eventsScannerStatusModelString,
    useFactory: (connection: Connection) =>
      connection.model('EventsScannerStatus', EventsScannerStatusSchema),
    inject: [databaseConnectionString]
  }
]
