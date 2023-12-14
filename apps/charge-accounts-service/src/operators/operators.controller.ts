import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { User } from '@app/accounts-service/users/user.decorator'
import { UsersService } from '@app/accounts-service/users/users.service'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { CreateOperatorDto } from '@app/accounts-service/operators/dto/create-operator.dto'

@Controller({ path: 'operators', version: '1' })
export class OperatorsController {
  constructor (
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService
  ) {}

  /**
   * Create user and project for an operator
   * @param authOperatorDto
   */
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async create (@Body() createOperatorDto: CreateOperatorDto, @User('sub') auth0Id: string) {
    const user = await this.usersService.create({
      name: `${createOperatorDto.firstName} ${createOperatorDto.lastName}`,
      email: createOperatorDto.email,
      auth0Id
    })
    const userObject = await this.usersService.findOneByAuth0Id(auth0Id)
    const project = await this.projectsService.create({
      ownerId: userObject._id,
      name: auth0Id,
      description: auth0Id
    })
    return {user, project}
  }
}
