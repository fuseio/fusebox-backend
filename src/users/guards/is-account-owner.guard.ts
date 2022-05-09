import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import { UsersService } from '../users.service';

@Injectable()
export class IsAccountOwnerGuard implements CanActivate {
  constructor(private usersService: UsersService) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const { params }: { params: { id: string } } = request;
    const auth0Id = request?.user?.sub;
    const userById = await this.usersService.findOne(params.id);

    if (!auth0Id || !userById || auth0Id !== userById.auth0Id) return false;

    return true;
  }
}
