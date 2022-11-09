import { Connection } from 'mongoose'
import { ApiKeySchema } from '@app/apps-service/api-keys/schemas/api-key.schema'
import { apiKeyModelString } from '@app/apps-service/api-keys/api-keys.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'

export const apiKeysProviders = [
  {
    provide: apiKeyModelString,
    useFactory: (connection: Connection) =>
      connection.model('ApiKey', ApiKeySchema),
    inject: [databaseConnectionString]
  }
]
