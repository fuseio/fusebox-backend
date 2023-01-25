import { Module } from '@nestjs/common'
import { databaseProviders } from '@app/common/database/database.providers'

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders]
})
export class DatabaseModule {}
