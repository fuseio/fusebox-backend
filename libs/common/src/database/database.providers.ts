import mongoose from 'mongoose'

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> => {
      mongoose.set('strictQuery', false)
      return mongoose.connect(process.env.MONGO_URI)
    }
  }
]
