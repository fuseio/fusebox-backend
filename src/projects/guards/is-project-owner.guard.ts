import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ProjectsService } from '../projects.service';

@Injectable()
export class IsProjectOwnerGuard implements CanActivate {
  constructor(private usersService: UsersService, private projectsService: ProjectsService) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const { params }: { params: { id: string } } = request;
    const auth0_id = request?.user?.sub;
    const project = await this.projectsService.findOne(params.id);
    const userById = await this.usersService.findOne(project?.ownerId);

    if (!auth0_id || !userById || auth0_id !== userById.auth0_id) return false;

    return true;
  }
}
