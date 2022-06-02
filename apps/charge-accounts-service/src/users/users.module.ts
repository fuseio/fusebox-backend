import { Module } from '@nestjs/common'
import { UsersService } from '@app/accounts-service/users/users.service'
import { UsersController } from '@app/accounts-service/users/users.controller'
import { DatabaseModule } from '@app/common'
import { usersProviders } from '@app/accounts-service/users/users.providers'
import { IsAccountOwnerGuard } from '@app/accounts-service/users/guards/is-account-owner.guard'

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, IsAccountOwnerGuard, ...usersProviders],
  exports: [UsersService]
})
export class UsersModule {}
