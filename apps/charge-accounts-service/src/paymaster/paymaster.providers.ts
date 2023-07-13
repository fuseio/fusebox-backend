import { Connection } from 'mongoose'
import { PaymasterInfoSchema } from '@app/accounts-service/paymaster/schemas/paymaster.schema'
import { paymasterInfoModelString } from '@app/accounts-service/paymaster/paymaster.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'

export const paymasterProviders = [
  {
    provide: paymasterInfoModelString,
    useFactory: (connection: Connection) =>
      connection.model('Paymaster', PaymasterInfoSchema),
    inject: [databaseConnectionString]
  }
]
