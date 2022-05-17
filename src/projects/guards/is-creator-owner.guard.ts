import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class IsCreatorOwnerGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ownerId = request.body?.ownerId;
    const auth0Id = request?.user?.sub;
    const userById = await this.usersService.findOne(ownerId);

    if (!auth0Id || !userById || auth0Id !== userById.auth0Id) return false;

    return true;
  }
}
