import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import { User } from '@app/accounts-service/users/user.decorator'
import { UsersService } from '@app/accounts-service/users/users.service'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { CreateOperatorDto } from '@app/accounts-service/operators/dto/create-operator.dto'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'

@Controller({ path: 'operators', version: '1' })
export class OperatorsController {
  constructor (
    private readonly operatorsService: OperatorsService,
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService
  ) {}

  /**
   * Validate operator
   * @param authOperatorDto
   * @returns the new operator JWT
   */
  @Post('/validate')
  validate (@Body() authOperatorDto: AuthOperatorDto) {
    const recoveredAddress = this.operatorsService.verifySignature(authOperatorDto)

    if (authOperatorDto.externallyOwnedAccountAddress !== recoveredAddress) {
      throw new HttpException('Wallet ownership verification failed', HttpStatus.FORBIDDEN)
    }

    return this.operatorsService.createJwt(recoveredAddress)
  }

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
    const { secretPrefix, secretLastFourChars } = await this.projectsService.getApiKeysInfo(projectObject._id)
    const project = {
      id: projectObject._id,
      ownerId: projectObject.ownerId,
      name: projectObject.name,
      description: projectObject.description,
      publicKey: publicKey.publicKey,
      secretPrefix,
      secretLastFourChars
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
    const { secretKey } = await this.projectsService.createSecret(projectObject._id)
    const project = {
      id: projectObject._id,
      ownerId: projectObject.ownerId,
      name: projectObject.name,
      description: projectObject.description,
      publicKey: publicKey.publicKey,
      secretKey
    }
    return { user, project }
  }
}
