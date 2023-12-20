import { Module } from '@nestjs/common'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { OperatorsController } from '@app/accounts-service/operators/operators.controller'
import { OperatorJwtStrategy } from '@app/accounts-service/operators/operator-jwt.strategy'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { AuthModule } from '@app/accounts-service/auth/auth.module'

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    AuthModule
  ],
  controllers: [OperatorsController],
  providers: [OperatorJwtStrategy, OperatorsService],
  exports: [OperatorsService]
})
export class OperatorsModule {}
