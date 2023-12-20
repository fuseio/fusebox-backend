import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
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
   * Get current operator
   * @param authOperatorDto
   * @returns the user and project with public key
   */
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async me (@Param('id') id: string, @User('sub') auth0Id: string) {
    const user = await this.usersService.findOneByAuth0Id(auth0Id)
    const projectObject = await this.projectsService.findOneByOwnerId(user._id)
    const publicKey = await this.projectsService.getPublic(projectObject._id)
    const project = {
      ownerId: projectObject.ownerId,
      name: projectObject.name,
      description: projectObject.description,
      publicKey: publicKey.publicKey
    }
    return { user, project }
  }

  /**
   * Create user and project for an operator
   * @param authOperatorDto
   * @returns the user and project with public key
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create (@Body() createOperatorDto: CreateOperatorDto, @User('sub') auth0Id: string) {
    const user = await this.usersService.create({
      name: `${createOperatorDto.firstName} ${createOperatorDto.lastName}`,
      email: createOperatorDto.email,
      auth0Id
    })
    const projectObject = await this.projectsService.create({
      ownerId: user._id,
      name: auth0Id,
      description: auth0Id
    })
    const publicKey = await this.projectsService.getPublic(projectObject._id)
    const project = {
      ownerId: projectObject.ownerId,
      name: projectObject.name,
      description: projectObject.description,
      publicKey: publicKey.publicKey
    }
    return { user, project }
  }
}
