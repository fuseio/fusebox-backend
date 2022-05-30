import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '@app/common';
import { usersProviders } from './users.providers';
import { IsAccountOwnerGuard } from './guards/is-account-owner.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, IsAccountOwnerGuard, ...usersProviders],
  exports: [UsersService],
})
export class UsersModule {}
