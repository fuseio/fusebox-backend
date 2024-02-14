import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ethers } from 'ethers'
import { notificationsService, smartWalletsService } from '@app/common/constants/microservices.constants'
import { PaymasterService } from '@app/accounts-service/paymaster/paymaster.service'
import { UsersService } from '@app/accounts-service/users/users.service'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'
import paymasterAbi from '@app/api-service/paymaster-api/abi/FuseVerifyingPaymasterSingleton.abi.json'
import etherspotWalletFactoryAbi from '@app/accounts-service/operators/abi/EtherspotWalletFactory.abi.json'
import { ConfigService } from '@nestjs/config'
import { CreateOperatorWalletDto } from '@app/accounts-service/operators/dto/create-operator-wallet.dto'
import { CreateOperatorUserDto } from '@app/accounts-service/operators/dto/create-operator-user.dto'
import { OperatorWallet } from '@app/accounts-service/operators/interfaces/operator-wallet.interface'
import { operatorWalletModelString } from '@app/accounts-service/operators/operators.constants'
import { Model, ObjectId } from 'mongoose'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { ClientProxy } from '@nestjs/microservices'
import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'
import { AnalyticsService } from '@app/accounts-service/analytics/analytics.service'

@Injectable()
export class OperatorsService {
  private readonly logger = new Logger(OperatorsService.name)
  constructor (
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly analyticsService: AnalyticsService,
    private configService: ConfigService,
    @Inject(operatorWalletModelString)
    private operatorWalletModel: Model<OperatorWallet>,
    private readonly paymasterService: PaymasterService,
    private readonly projectsService: ProjectsService,
    @Inject(smartWalletsService)
    private readonly dataLayerClient: ClientProxy,
    @Inject(notificationsService)
    private readonly notificationsClient: ClientProxy

  ) { }

  async checkOperatorExistenceByEoaAddress (eoaAddress: string): Promise<number> {
    const operator = await this.usersService.findOneByAuth0Id(eoaAddress)
    return operator ? 200 : 404
  }

  validate (authOperatorDto: AuthOperatorDto): string {
    const recoveredAddress = ethers.utils.verifyMessage(authOperatorDto.message, authOperatorDto.signature)
    if (authOperatorDto.externallyOwnedAccountAddress !== recoveredAddress) {
      throw new HttpException('Wallet ownership verification failed', HttpStatus.FORBIDDEN)
    }
    return this.jwtService.sign({
      sub: recoveredAddress
    })
  }

  async getOperatorUserAndProject (auth0Id: string) {
    try {
      const user = await this.usersService.findOneByAuth0Id(auth0Id)
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }

      const projectObject = await this.projectsService.findOneByOwnerId(user._id)
      if (!projectObject) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
      }
      // await this.analyticsService.operatorAccountActivationEvent({ id: user._id, projectId: projectObject._id })

      const apiKeyInfo = await this.projectsService.getApiKeysInfo(projectObject._id)
      if (!apiKeyInfo) {
        throw new HttpException('API Key info not found', HttpStatus.NOT_FOUND)
      }

      const paymasters = await this.paymasterService.findActivePaymasters(projectObject._id)
      if (!paymasters || paymasters.length === 0) {
        throw new HttpException('No active paymasters found', HttpStatus.NOT_FOUND)
      }

      const project = {
        id: projectObject._id,
        ownerId: projectObject.ownerId,
        name: projectObject.name,
        description: projectObject.description,
        publicKey: apiKeyInfo.publicKey,
        sandboxKey: apiKeyInfo.sandboxKey,
        secretPrefix: apiKeyInfo.secretPrefix,
        secretLastFourChars: apiKeyInfo.secretLastFourChars,
        sponsorId: paymasters[0].sponsorId
      }

      return { user, project }
    } catch (error) {
      this.errorHandler(error)
    }
  }

  async createOperatorUserAndProjectAndWallet (createOperatorUserDto: CreateOperatorUserDto, auth0Id: string) {
    this.validateInput(createOperatorUserDto, auth0Id)

    try {
      const user = await this.createUser(createOperatorUserDto, auth0Id)
      const projectObject = await this.createProject(user, auth0Id)
      const publicKey = await this.projectsService.getPublic(projectObject._id)
      const secretKey = await this.createProjectSecret(projectObject)
      const sponsorId = await this.createPaymasters(projectObject)

      const predictedWallet = await this.predictWallet(auth0Id, 0, '0_1_0', 'production')
      await this.createOperatorWallet(user, predictedWallet)
      await this.addAddressToOperatorsWebhook(predictedWallet)
      await this.addAddressToTokenReceiveWebhook(predictedWallet)
      return this.constructUserProjectResponse(user, projectObject, publicKey.publicKey, secretKey, sponsorId)
    } catch (error) {
      this.errorHandler(error)
    }
  }

  private async createUser (createOperatorUserDto: CreateOperatorUserDto, auth0Id: string) {
    return await this.usersService.create({
      name: `${createOperatorUserDto.firstName} ${createOperatorUserDto.lastName}`,
      email: createOperatorUserDto.email,
      auth0Id
    })
  }

  private async createProject (user: any, auth0Id: string) {
    return await this.projectsService.create({
      ownerId: user._id,
      name: auth0Id,
      description: auth0Id
    })
  }

  private async createProjectSecret (projectObject: any) {
    const { secretKey } = await this.projectsService.createSecret({ projectId: projectObject._id, createLegacyAccount: false })
    if (!secretKey) {
      throw new HttpException('Failed to create secret', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return secretKey
  }

  private async createPaymasters (projectObject: any) {
    const paymasters = await this.paymasterService.create(projectObject._id, '0_1_0')
    if (!paymasters) {
      throw new HttpException('Failed to create paymasters', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return paymasters[0].sponsorId
  }

  private async createOperatorWallet (user: any, predictedWallet: string) {
    const operatorWalletCreationResult = await this.operatorWalletModel.create(new CreateOperatorWalletDto(user._id, predictedWallet.toLowerCase()))
    if (!operatorWalletCreationResult) {
      throw new HttpException('Failed to create operator wallet', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  private constructUserProjectResponse (user: any, projectObject: any, publicKey: string, secretKey: string, sponsorId: string) {
    // Constructs the response object from the created entities
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        auth0Id: user.auth0Id
      },
      project: {
        id: projectObject._id,
        ownerId: projectObject.ownerId,
        name: projectObject.name,
        description: projectObject.description,
        publicKey,
        secretKey,
        sponsorId
      }
    }
  }

  private errorHandler (error: any) {
    // Improved error handling, distinguishing between different error types
    if (error instanceof HttpException) {
      this.logger.error(`Failed to create operator: ${error.getResponse()}`)
      throw new InternalServerErrorException(error.message)
    } else {
      this.logger.error(`Failed to create operator: ${error.message}`)
      throw new InternalServerErrorException(error.message)
    }
  }

  async predictWallet (owner: string, index: number, ver: string, environment: string): Promise<string> {
    const paymasterEnvs = this.configService.getOrThrow(`paymaster.${ver}`)
    const contractAddress = paymasterEnvs[environment].etherspotWalletFactoryContractAddress

    const provider = new ethers.providers.JsonRpcProvider(paymasterEnvs[environment].url)
    const contract = new ethers.Contract(contractAddress, etherspotWalletFactoryAbi, provider)

    try {
      return await contract.getAddress(owner, index)
    } catch (error) {
      throw new InternalServerErrorException(`Failed to predict wallet: ${error}`)
    }
  }

  async handleWebhookReceiveAndFundPaymasterAndDeleteWalletAddressFromOperatorsWebhook (webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log(`handleWebhook: ${JSON.stringify(webhookEvent)}`)
    const DEPOSIT_REQUIRED = 10 // Consider moving to a config or class constant
    const valueEthInWebhookEvent = webhookEvent.valueEth
    const address = webhookEvent.to.toLowerCase()

    try {
      if (webhookEvent.direction !== 'incoming') {
        throw new HttpException('Webhook event direction is not incoming.', HttpStatus.BAD_REQUEST)
      }
      if (webhookEvent.tokenType !== 'FUSE') {
        throw new HttpException('Webhook event token type is not FUSE.', HttpStatus.BAD_REQUEST)
      }
      if (!webhookEvent.to || webhookEvent.to.trim() === '') {
        throw new HttpException('Webhook event "to" address is missing or empty.', HttpStatus.BAD_REQUEST)
      }

      const balance = await this.getBalance(address, '0_1_0', 'production')
      if (!balance) {
        throw new HttpException('Failed to retrieve balance.', HttpStatus.INTERNAL_SERVER_ERROR)
      }
      const isBalanceSufficient = parseFloat(balance) >= DEPOSIT_REQUIRED

      if (parseFloat(balance) < parseFloat(valueEthInWebhookEvent)) {
        throw new HttpException('Webhook event contains more FUSE than onChain balance', HttpStatus.OK)
      }
      if (!isBalanceSufficient) {
        throw new HttpException('Balance is not sufficient', HttpStatus.OK)
      }

      const wallet = await this.findOperatorBySmartWallet(address)
      if (!wallet) {
        throw new HttpException('Wallet not found.', HttpStatus.NOT_FOUND)
      }
      if (wallet.isActivated) {
        throw new HttpException('Account already activated', HttpStatus.OK)
      }

      const project = await this.projectsService.findOneByOwnerId(wallet.ownerId)
      if (!project) {
        throw new HttpException('Project not found.', HttpStatus.NOT_FOUND)
      }

      const [paymaster] = await this.paymasterService.findActivePaymasters(project._id)
      if (!paymaster?.sponsorId) {
        throw new HttpException(`Sponsor id for project id: ${project._id} is missing`, HttpStatus.INTERNAL_SERVER_ERROR)
      }

      await this.fundPaymaster(paymaster.sponsorId, '1', '0_1_0', 'production')
      // Note: If the 'fundPaymaster' call fails, the operator's account will not be activated,
      // and the webhook call will respond negatively. In such cases, a retry mechanism from the
      // notification service will be utilized.
      await this.updateIsActivated(wallet._id, true)
      this.analyticsService.operatorAccountActivationEvent({ id: wallet.ownerId, projectId: project._id })
      await this.deleteAddressFromOperatorsWebhook(address)
    } catch (error) {
      if (error instanceof HttpException) {
        this.logger.error(`Error on operator funding: ${error.getResponse()}`)
        throw error // Rethrow the HttpException to be handled by NestJS's global exception filter
      } else {
        this.logger.error(`Error on operator funding: ${error.message}`)
        throw new InternalServerErrorException(error.message)
      }
    }
  }

  async fundPaymaster (sponsorId: string, amount: string, ver: string, environment: string): Promise<any> {
    const paymasterEnvs = this.configService.getOrThrow(`paymaster.${ver}`)
    const contractAddress = paymasterEnvs[environment].paymasterContractAddress
    const privateKey = this.configService.get('PAYMASTER_FUNDER_PRIVATE_KEY')
    const provider = new ethers.providers.JsonRpcProvider(paymasterEnvs[environment].url)
    const wallet = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(contractAddress, paymasterAbi, wallet)
    const ether = ethers.utils.parseEther(amount)
    try {
      // Note: The transaction hash retrieval is intentionally not awaited here due to its ~14s delay.
      // However, any errors arising from this call will still be caught and handled appropriately.
      await contract.depositFor(sponsorId, { value: ether })
      return HttpStatus.OK
    } catch (error) {
      this.logger.error(`depositFor fund paymaster failed: ${sponsorId} value: ${amount} etherAmount: ${ether} error: ${error}`)
      throw new InternalServerErrorException(`depositFor fund paymaster error: ${error}`)
    }
  }

  async getSponsoredTransactionsCount (auth0Id: string) {
    const user = await this.usersService.findOneByAuth0Id(auth0Id)
    const project = await this.projectsService.findOneByOwnerId(user._id)
    const paymasters = await this.paymasterService.findActivePaymasters(project._id)
    const sponsorId = paymasters?.[0]?.sponsorId
    let sponsoredTransactions = 0
    if (sponsorId) {
      sponsoredTransactions = await callMSFunction(this.dataLayerClient, 'sponsored-transactions-count', sponsorId)
        .catch(e => {
          this.logger.log(`sponsored-transactions-count failed: ${JSON.stringify(e)}`)
        })
    }
    return { sponsoredTransactions }
  }

  private validateInput (createOperatorUserDto: CreateOperatorUserDto, auth0Id: string) {
    if (!createOperatorUserDto.email || !createOperatorUserDto.firstName || !createOperatorUserDto.lastName) {
      throw new BadRequestException('Missing required fields in createOperatorUserDto')
    }
    if (!auth0Id) {
      throw new BadRequestException('auth0Id is required')
    }
  }

  async findWalletOwner (value: string): Promise<OperatorWallet> {
    return this.operatorWalletModel.findOne({ ownerId: value })
  }

  async findOperatorBySmartWallet (value: string): Promise<OperatorWallet> {
    return this.operatorWalletModel.findOne({ smartWalletAddress: value.toLowerCase() })
  }

  async updateIsActivated (_id: ObjectId, isActivated: boolean): Promise<any> {
    return this.operatorWalletModel.updateOne({ _id }, { isActivated })
  }

  async getBalance (address: string, ver: string, environment: string): Promise<string> {
    const paymasterEnvs = this.configService.getOrThrow(`paymaster.${ver}`)
    const provider = new ethers.providers.JsonRpcProvider(paymasterEnvs[environment].url)
    try {
      const balance = await provider.getBalance(address)
      return ethers.utils.formatEther(balance)
    } catch (error) {
      throw new InternalServerErrorException(`getBalance error: ${error}`)
    }
  }

  async checkWalletActivationStatus (auth0Id) {
    const user = await this.usersService.findOneByAuth0Id(auth0Id)
    const wallet = await this.findWalletOwner(user._id)
    return wallet?.isActivated || false
  }

  async addAddressToOperatorsWebhook (walletAddress: string) {
    const webhookId = this.configService.get('PAYMASTER_FUNDER_WEBHOOK_ID')
    const requestBody: CreateWebhookAddressesDto = {
      webhookId,
      addresses: [walletAddress]
    }
    return callMSFunction(this.notificationsClient, 'create_addresses', requestBody)
  }

  async addAddressToTokenReceiveWebhook (walletAddress: string) {
    const webhookId = this.configService.get('INCOMING_TOKEN_TRANSFERS_WEBHOOK_ID')
    const requestBody: CreateWebhookAddressesDto = {
      webhookId,
      addresses: [walletAddress]
    }
    return callMSFunction(this.notificationsClient, 'create_addresses', requestBody)
  }

  async deleteAddressFromOperatorsWebhook (walletAddress: string) {
    const webhookId = this.configService.get('PAYMASTER_FUNDER_WEBHOOK_ID')
    const requestBody: CreateWebhookAddressesDto = {
      webhookId,
      addresses: [walletAddress]
    }
    return callMSFunction(this.notificationsClient, 'delete_addresses', requestBody)
  }
}
