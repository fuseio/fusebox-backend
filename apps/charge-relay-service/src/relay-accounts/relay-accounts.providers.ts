import { Connection } from 'mongoose'
import { relayAccountModelString } from '@app/relay-service/relay-accounts/relay-accounts.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { RelayAccountSchema } from '@app/relay-service/relay-accounts/schemas/relay-accounts.schema'

export const relayProviders = [
  {
    provide: relayAccountModelString,
    useFactory: (connection: Connection) =>
      connection.model('RelayAccount', RelayAccountSchema),
    inject: [databaseConnectionString]
  }
]
