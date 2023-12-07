import { Module } from '@nestjs/common'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { OperatorsController } from '@app/accounts-service/operators/operators.controller'
import { DatabaseModule } from '@app/common'
import { operatorsProviders } from '@app/accounts-service/operators/operators.providers'

@Module({
  imports: [DatabaseModule],
  controllers: [OperatorsController],
  providers: [OperatorsService, ...operatorsProviders],
  exports: [OperatorsService]
})
export class OperatorsModule {}
