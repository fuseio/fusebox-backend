import mongoose from 'mongoose'
import { Logger } from '@nestjs/common'

const logger = new Logger('Database')

/**
 * A replica-set election is invisible here today. `mongoose.connect()` registers no
 * listeners, so a primary step-down shows up only as whichever query happened to be
 * running failing with "not primary and secondaryOk=false" — attributed to that feature
 * rather than to the database, and completely silent for a service that is idle at the
 * time. Log the topology events so a failover is unambiguous and timestamped.
 *
 * Diagnostic only: no connection behaviour is changed. Whether the driver can actually
 * follow an election depends on MONGO_URI listing the replica set (multiple hosts with
 * replicaSet=, or mongodb+srv://) rather than pinning one member.
 */
function registerConnectionLogging (connection: mongoose.Connection): void {
  connection.on('connected', () => logger.log('Mongo connected'))
  connection.on('disconnected', () => logger.error('Mongo disconnected'))
  connection.on('reconnected', () => logger.warn('Mongo reconnected'))
  connection.on('error', err => logger.error(`Mongo connection error: ${err?.message ?? err}`))
}

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> => {
      mongoose.set('strictQuery', false)
      registerConnectionLogging(mongoose.connection)
      return mongoose.connect(process.env.MONGO_URI)
    }
  }
]
