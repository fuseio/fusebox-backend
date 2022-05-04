import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class IsCreatorOwnerGuard implements CanActivate {
  constructor(private usersService: UsersService) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const ownerId = request.body?.ownerId;
    const auth0_id = request?.user?.sub;
    const userById = await this.usersService.findOne(ownerId);

    if (!auth0_id || !userById || auth0_id !== userById.auth0_id) return false;

    return true;
  }
}
