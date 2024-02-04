import { Body, Controller, Get, Head, HttpException, HttpStatus, Inject, Logger, Param, Post, Res, UseGuards } from '@nestjs/common'
import { User } from '@app/accounts-service/users/user.decorator'
import { UsersService } from '@app/accounts-service/users/users.service'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { CreateOperatorDto } from '@app/accounts-service/operators/dto/create-operator.dto'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'
import { PaymasterService } from '@app/accounts-service/paymaster/paymaster.service'
import { CreateOperatorWalletDto } from '@app/accounts-service/operators/dto/create-operator-wallet.dto'
import { Response } from 'express'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { smartWalletsService } from '@app/common/constants/microservices.constants'

@Controller({ path: 'operators', version: '1' })
export class OperatorsController {
  private readonly logger = new Logger(OperatorsController.name)
  constructor (
    private readonly operatorsService: OperatorsService,
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
    private readonly paymasterService: PaymasterService,
    private readonly configService: ConfigService,
    @Inject(smartWalletsService) private readonly dataLayerClient: ClientProxy
  ) { }

  /**
   * Check if operator exist
   * @param eoaAddress
   */
  @Head('/:eoaAddress')
  async check (@Param('eoaAddress') eoaAddress: string, @Res() response: Response) {
    const user = await this.usersService.findOneByAuth0Id(eoaAddress)
    if (!user) {
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
    const wallet = await this.operatorsService.findWalletOwner(user._id)
    const sponsoredTransactions = sponsorId
      ? await callMSFunction(this.dataLayerClient, 'sponsored-transactions-count', sponsorId).catch(e => {
        this.logger.log(`sponsored-transactions-count failed: ${JSON.stringify(e)}`)
      })
      : 0
    const project = {
      id: projectObject._id,
      ownerId: projectObject.ownerId,
      name: projectObject.name,
      description: projectObject.description,
      publicKey: publicKey.publicKey,
      secretPrefix,
      secretLastFourChars,
      sponsorId,
      isActivated: wallet?.isActivated,
      sponsoredTransactions: sponsoredTransactions || 0
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

    const predictedWallet = await this.operatorsService.predictWallet(auth0Id, 0, '0_1_0', 'production')
    const createOperatorWalletDto = new CreateOperatorWalletDto()
    createOperatorWalletDto.ownerId = user._id
    createOperatorWalletDto.smartWalletAddress = predictedWallet.toLowerCase()
    await this.operatorsService.createWallet(createOperatorWalletDto)

    const apiKey = this.configService.get('PAYMASTER_FUNDER_API_KEY')
    const webhookId = this.configService.get('PAYMASTER_FUNDER_WEBHOOK_ID')
    await this.operatorsService.addWebhookAddress({ walletAddress: predictedWallet, webhookId, apiKey })

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
   * Fund paymaster webhook
   */
  @Post('/fund-paymaster')
  async paymaster (@Body() webhookEvent: WebhookEvent) {
    const { address, valueEth } = await this.operatorsService.handleWebhook(webhookEvent)
    const DEPOSIT_REQUIRED = 10
    let isBalanceSufficient = parseFloat(valueEth) >= DEPOSIT_REQUIRED

    // Check if operator wallet already contains sufficient balance through multiple small transfers
    if (!isBalanceSufficient) {
      const balance = await this.operatorsService.getBalance(address, '0_1_0', 'production')
      isBalanceSufficient = parseFloat(balance) >= DEPOSIT_REQUIRED
    }

    if (!isBalanceSufficient) {
      return
    }

    const wallet = await this.operatorsService.findOperatorBySmartWallet(address)
    if (wallet.isActivated) {
      return
    }

    const project = await this.projectsService.findOneByOwnerId(wallet.ownerId)
    const [paymaster] = await this.paymasterService.findActivePaymasters(project._id)
    if (!paymaster?.sponsorId) {
      return
    }

    await this.operatorsService.updateIsActivated(wallet._id, true)
    await this.operatorsService.fundPaymaster(paymaster.sponsorId, '1', '0_1_0', 'production')
  }
}
