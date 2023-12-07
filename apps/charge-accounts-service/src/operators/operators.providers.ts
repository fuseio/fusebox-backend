import { Connection } from 'mongoose'
import { OperatorSchema } from '@app/accounts-service/operators/schemas/operator'
import { operatorModelString } from '@app/accounts-service/operators/operators.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'

export const operatorsProviders = [
  {
    provide: operatorModelString,
    useFactory: (connection: Connection) =>
      connection.model('Operator', OperatorSchema),
    inject: [databaseConnectionString]
  }
]
