import { databaseConnectionString } from '@app/common/constants/database.constants'
import { eventsScannerStatusModelString, ERC20LogsFilterString, userOpLogsFilterString } from '@app/notifications-service/events-scanner/events-scanner.constants'
import { EventsScannerStatusSchema } from '@app/notifications-service/events-scanner/schemas/events-scanner-status.schema'
import { Connection } from 'mongoose'
import { ERC20_TRANSFER_EVENT_HASH, ENTRY_POINT_USER_OP_EVENT_HASH } from '@app/notifications-service/common/constants/events'
import { ENTRY_POINT_ADDRESS } from '../common/constants/addresses'

export const eventsScannerProviders = [
  {
    provide: eventsScannerStatusModelString,
    useFactory: (connection: Connection) =>
      connection.model('EventsScannerStatus', EventsScannerStatusSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: ERC20LogsFilterString,
    useFactory: () => {
      return { 
        topics: [ERC20_TRANSFER_EVENT_HASH]
      }
    }
  },
  {
    provide: userOpLogsFilterString,
    useFactory: () => {
      return { 
        address: ENTRY_POINT_ADDRESS,
        topics: [ENTRY_POINT_USER_OP_EVENT_HASH]
      }
    }
  }
]


