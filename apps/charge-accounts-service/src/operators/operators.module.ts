import { Module } from '@nestjs/common'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { OperatorsController } from '@app/accounts-service/operators/operators.controller'

@Module({
  imports: [UsersModule, ProjectsModule],
  controllers: [OperatorsController]
})
export class OperatorsModule {}
