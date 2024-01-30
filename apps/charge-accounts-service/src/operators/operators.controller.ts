import { Body, Controller, Get, Head, HttpException, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common'
import { User } from '@app/accounts-service/users/user.decorator'
import { UsersService } from '@app/accounts-service/users/users.service'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { CreateOperatorDto } from '@app/accounts-service/operators/dto/create-operator.dto'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'
import { PaymasterService } from '@app/accounts-service/paymaster/paymaster.service'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { PrdOrSbxKeyRequest } from '@app/accounts-service/operators/interfaces/production-or-sandbox-key.interface'
import { CreateOperatorWalletDto } from '@app/accounts-service/operators/dto/create-operator-wallet.dto'
import { Response } from 'express'

@Controller({ path: 'operators', version: '1' })
export class OperatorsController {
  constructor (
    private readonly operatorsService: OperatorsService,
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
    private readonly paymasterService: PaymasterService
  ) { }

  /**
   * Check if operator exist
   * @param id
   */
  @Head('/:id')
  async check (@Param('id') id: string, @Res() response: Response) {
    const user = await this.usersService.findOne(id)
    if(!user) {
      response.status(404).send()
    }
    response.status(200).send()
  }

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
    const paymasters = await this.paymasterService.findActivePaymasters(projectObject._id)
    const sponsorId = paymasters?.[0]?.sponsorId
    const project = {
      id: projectObject._id,
      ownerId: projectObject.ownerId,
      name: projectObject.name,
      description: projectObject.description,
      publicKey: publicKey.publicKey,
      secretPrefix,
      secretLastFourChars,
      sponsorId
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
    const paymasters = await this.paymasterService.create(projectObject._id, '0_1_0')
    const { sponsorId } = paymasters[0]
    const project = {
      id: projectObject._id,
      ownerId: projectObject.ownerId,
      name: projectObject.name,
      description: projectObject.description,
      publicKey: publicKey.publicKey,
      secretKey,
      sponsorId
    }
    return { user, project }
  }

  /**
   * Fund paymaster
   */
  @UseGuards(JwtAuthGuard, IsPrdOrSbxKeyGuard)
  @Post('/fund-paymaster')
  async paymaster (@User('sub') auth0Id: string, @Req() request: PrdOrSbxKeyRequest) {
    const user = await this.usersService.findOneByAuth0Id(auth0Id)
    const projectObject = await this.projectsService.findOneByOwnerId(user._id)
    const paymasters = await this.paymasterService.findActivePaymasters(projectObject._id)
    const sponsorId = paymasters?.[0]?.sponsorId
    if (!sponsorId) {
      throw new HttpException('Sponsor ID does not exist', HttpStatus.NOT_FOUND)
    }
    return await this.operatorsService.fundPaymaster(sponsorId, '1', '0_1_0', request)
  }

  /**
   * Create operator wallet
   */
  @UseGuards(JwtAuthGuard, IsPrdOrSbxKeyGuard)
  @Post('/wallet')
  async wallet (@User('sub') auth0Id: string, @Req() request: PrdOrSbxKeyRequest) {
    const smartWalletsAA = await this.operatorsService.getSmartWalletsAA(auth0Id, 0, '0_1_0', request)
    const user = await this.usersService.findOneByAuth0Id(auth0Id)
    const createOperatorWalletDto = new CreateOperatorWalletDto()
    createOperatorWalletDto.ownerId = user._id
    createOperatorWalletDto.smartWalletAddress = smartWalletsAA
    return this.operatorsService.createWallet(createOperatorWalletDto)
  }
}
