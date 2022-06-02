import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { UsersService } from '@app/accounts-service/users/users.service'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'

@Injectable()
export class IsProjectOwnerGuard implements CanActivate {
  constructor (
    private usersService: UsersService,
    private projectsService: ProjectsService
  ) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { params }: { params: { id: string; projectId: string } } = request
    const auth0Id = request?.user?.sub
    const projectId = params.id || params.projectId
    const project = await this.projectsService.findOne(projectId)
    const userById = await this.usersService.findOne(project?.ownerId)

    if (!auth0Id || !userById || auth0Id !== userById.auth0Id) return false

    return true
  }
}
