import { Connection } from 'mongoose'
import { ApplicationSchema } from '@app/accounts-service/app-store/schemas/application.schema'
import { applicationModelString } from '@app/accounts-service/app-store/constants/app-store.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'

export const appStoreProviders = [
  {
    provide: applicationModelString,
    useFactory: (connection: Connection) =>
      connection.model('Application', ApplicationSchema),
    inject: [databaseConnectionString]
  }
]
