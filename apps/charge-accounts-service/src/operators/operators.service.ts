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
import { CreateOperatorUserDto } from '@app/accounts-service/operators/dto/create-operator-user.dto'
import { OperatorWallet } from '@app/accounts-service/operators/interfaces/operator-wallet.interface'
import { operatorWalletModelString, operatorRefreshTokenModelString } from '@app/accounts-service/operators/operators.constants'
import { Model, ObjectId } from 'mongoose'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { ClientProxy } from '@nestjs/microservices'
import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'
import { AnalyticsService } from '@app/common/services/analytics.service'
import axios from 'axios'
import { User } from '@app/accounts-service/users/interfaces/user.interface'
import { OperatorProject } from '@app/accounts-service/operators/interfaces/operator-project.interface'
import { OperatorUserProjectResponse } from '@app/accounts-service/operators/interfaces/operator-user-project-response.interface'
import { OperatorRefreshToken } from '@app/accounts-service/operators/interfaces/operator-refresh-token.interface'
import { Response } from 'express'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class OperatorsService {
  private readonly logger = new Logger(OperatorsService.name)
  constructor (
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private configService: ConfigService,
    @Inject(operatorWalletModelString)
    private operatorWalletModel: Model<OperatorWallet>,
    private readonly paymasterService: PaymasterService,
    private readonly projectsService: ProjectsService,
    @Inject(smartWalletsService)
    private readonly dataLayerClient: ClientProxy,
    @Inject(notificationsService)
    private readonly notificationsClient: ClientProxy,
    private readonly analyticsService: AnalyticsService,
    @Inject(operatorRefreshTokenModelString)
    private operatorRefreshTokenModel: Model<OperatorRefreshToken>
  ) { }

  async checkOperatorExistenceByEoaAddress (eoaAddress: string): Promise<number> {
    const operator = await this.usersService.findOneByAuth0Id(eoaAddress)
    return operator ? 200 : 404
  }

  async validate (authOperatorDto: AuthOperatorDto, response: Response) {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(authOperatorDto.message, authOperatorDto.signature)
      if (authOperatorDto.externallyOwnedAccountAddress !== recoveredAddress) {
        throw new HttpException('Wallet ownership verification failed', HttpStatus.FORBIDDEN)
      }
      await this.createOperatorJwtTokens(recoveredAddress, response)
      response.status(200).send()
    } catch (error) {
      this.logger.error(`Failed to validate operator: ${error.message}`)
      throw error
    }
  }

  async getOperatorUserAndProject (auth0Id: string) {
    try {
      const user = await this.usersService.findOneByAuth0Id(auth0Id)
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }

      const wallet = await this.findWalletOwner(user._id)
      if (!wallet) {
        throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND)
      }

      const projectObject = await this.projectsService.findOneByOwnerId(user._id)
      if (!projectObject) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
      }

      const apiKeyInfo = await this.projectsService.getApiKeysInfo(projectObject._id)
      if (!apiKeyInfo) {
        throw new HttpException('API Key info not found', HttpStatus.NOT_FOUND)
      }

      const paymasters = await this.paymasterService.findActivePaymasters(projectObject._id)
      if (!paymasters || paymasters.length === 0) {
        throw new HttpException('No active paymasters found', HttpStatus.NOT_FOUND)
      }

      const project: OperatorProject = {
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

      return this.constructUserProjectResponse(user, project, wallet)
    } catch (error) {
      this.errorHandler(error)
    }
  }

  async createOperatorUserAndProjectAndWallet (createOperatorUserDto: CreateOperatorUserDto, auth0Id: string) {
    this.validateInput(createOperatorUserDto, auth0Id)

    try {
      const user = await this.createUser(createOperatorUserDto, auth0Id)
      const projectObject = await this.createProject(user, createOperatorUserDto)
      const secretKey = await this.createProjectSecret(projectObject)
      const apiKeyInfo = await this.projectsService.getApiKeysInfo(projectObject._id)
      const sponsorId = await this.createPaymasters(projectObject)
      const predictedWallet = await this.predictWallet(auth0Id, 0, '0_1_0', 'production')
      const eventData = {
        email: user.email,
        apiKey: apiKeyInfo.publicKey
      }
      const wallet = await this.createOperatorWallet(user, predictedWallet)
      await this.addAddressToOperatorsWebhook(predictedWallet)
      await this.addAddressToTokenReceiveWebhook(predictedWallet)
      this.googleFormSubmit(createOperatorUserDto)
      this.analyticsService.trackEvent('New Operator Created', { ...eventData }, { user_id: user?.auth0Id })
      const project: OperatorProject = {
        id: projectObject._id,
        ownerId: projectObject.ownerId,
        name: projectObject.name,
        description: projectObject.description,
        publicKey: apiKeyInfo.publicKey,
        sandboxKey: apiKeyInfo.sandboxKey,
        secretPrefix: apiKeyInfo.secretPrefix,
        secretLastFourChars: apiKeyInfo.secretLastFourChars,
        sponsorId
      }
      return this.constructUserProjectResponse(user, project, wallet, secretKey)
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

  private async createProject (user: any, createOperatorUserDto: CreateOperatorUserDto) {
    return await this.projectsService.create({
      ownerId: user._id,
      name: createOperatorUserDto.name || user.name,
      description: createOperatorUserDto.description || 'Empty description'
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
    const operatorWalletCreationResult = await this.operatorWalletModel.create({
      ownerId: user._id,
      smartWalletAddress: predictedWallet.toLowerCase()
    })
    if (!operatorWalletCreationResult) {
      throw new HttpException('Failed to create operator wallet', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return operatorWalletCreationResult
  }

  private constructUserProjectResponse (user: User, project: OperatorProject, wallet: OperatorWallet, secretKey?: string): OperatorUserProjectResponse {
    // Constructs the response object from the entities
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        auth0Id: user.auth0Id,
        smartWalletAddress: wallet.smartWalletAddress
      },
      project: {
        id: project.id,
        ownerId: project.ownerId,
        name: project.name,
        description: project.description,
        publicKey: project.publicKey,
        sandboxKey: project.sandboxKey,
        secretPrefix: project.secretPrefix,
        secretLastFourChars: project.secretLastFourChars,
        sponsorId: project.sponsorId,
        secretKey
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
      try {
        this.operatorAccountActivationEvent({ id: wallet.ownerId, projectId: project._id })
      } catch (error) {
        this.logger.error(`Error on sending activation event to Amplitude: ${error}`)
      }
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
      // Estimate gas
      const gasEstimate = await contract.estimateGas.depositFor(sponsorId, { value: ether })

      // Get current fee data
      const feeData = await provider.getFeeData()

      // Ensure minimum priority fee of 10 Gwei
      const minPriorityFee = ethers.utils.parseUnits('10', 'gwei')
      const maxPriorityFeePerGas = ethers.BigNumber.from(feeData.maxPriorityFeePerGas).gt(minPriorityFee)
        ? feeData.maxPriorityFeePerGas
        : minPriorityFee

      // Calculate max fee: max(2 * baseFee + maxPriorityFeePerGas, feeData.maxFeePerGas)
      const maxFeePerGas = ethers.BigNumber.from(feeData.lastBaseFeePerGas).mul(2).add(maxPriorityFeePerGas)
      const finalMaxFeePerGas = maxFeePerGas.gt(feeData.maxFeePerGas) ? maxFeePerGas : feeData.maxFeePerGas

      const txOptions = {
        value: ether,
        maxPriorityFeePerGas,
        maxFeePerGas: finalMaxFeePerGas,
        gasLimit: gasEstimate.mul(12).div(10) // Add 20% buffer to estimated gas
      }

      this.logger.log(`Sending transaction with options: ${JSON.stringify(txOptions)}`)

      await contract.depositFor(sponsorId, txOptions)

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

  async operatorAccountActivationEvent ({ id, projectId }) {
    try {
      const user = await this.usersService.findOne(id)
      const publicKey = (await this.projectsService.getPublic(projectId)).publicKey
      const eventData = {
        email: user.email,
        apiKey: publicKey
      }
      this.analyticsService.trackEvent('Operator Account Activated', { ...eventData }, { user_id: user?.auth0Id })
    } catch (error) {
      this.logger.error('Error tracking event:', error)
    }
  }

  async googleFormSubmit (createOperatorUserDto: CreateOperatorUserDto) {
    const formActionUrl = this.configService.getOrThrow('googleOperatorFormUrl')

    const formData = new URLSearchParams()
    formData.append('entry.1781500597', createOperatorUserDto.email)
    formData.append('entry.1823923312', createOperatorUserDto.firstName)
    formData.append('entry.995318623', createOperatorUserDto.lastName)
    formData.append('entry.1016494914', createOperatorUserDto.name)

    try {
      await axios.post(formActionUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      this.logger.log('Submission to Google Form successful')
    } catch (error) {
      this.logger.error('Submission to Google Form failed:', error.response ? error.response.data : error.message)
      throw new HttpException(
        `Error sending data to Google Form: ${error.response?.statusText || 'Unknown Error'}: ${error.response?.data?.error || ''}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findRefreshToken (auth0Id: string): Promise<OperatorRefreshToken> {
    return this.operatorRefreshTokenModel.findOne({ auth0Id }).sort({ createdAt: -1 })
  }

  async createRefreshToken (auth0Id: string, refreshToken: string): Promise<OperatorRefreshToken> {
    return this.operatorRefreshTokenModel.create({ auth0Id, refreshToken })
  }

  async markRefreshTokenAsUsed (refreshToken: string) {
    return this.operatorRefreshTokenModel.updateOne(
      { refreshToken, usedAt: null },
      { usedAt: new Date() }
    )
  }

  async invalidateRefreshTokens (auth0Id: string) {
    return this.operatorRefreshTokenModel.updateMany(
      { auth0Id, invalidAt: null },
      { invalidAt: new Date() }
    )
  }

  async hashRefreshToken (token: string) {
    const salt = await bcrypt.genSalt()
    return bcrypt.hash(token, salt)
  }

  async compareRefreshToken (plainToken: string, hashedToken: string) {
    return bcrypt.compare(plainToken, hashedToken)
  }

  async validateRefreshToken (token: string, response: Response) {
    try {
      const verifiedRefreshToken = this.jwtService.verify(
        token,
        {
          secret: this.configService.get('OPERATOR_REFRESH_JWT_SECRET')
        }
      )
      if (!verifiedRefreshToken) {
        throw new HttpException('Refresh token verification failed', HttpStatus.UNAUTHORIZED)
      }

      const refreshToken = await this.findRefreshToken(verifiedRefreshToken.sub)
      if (!refreshToken) {
        throw new HttpException('Refresh token does not exist', HttpStatus.NOT_FOUND)
      }

      if (verifiedRefreshToken.sub !== refreshToken.auth0Id) {
        throw new HttpException('Refresh token does not match', HttpStatus.UNAUTHORIZED)
      }

      const currentTime = Math.floor(Date.now() / 1000)
      if (currentTime > verifiedRefreshToken.exp) {
        throw new HttpException('Refresh token expired', HttpStatus.UNAUTHORIZED)
      }

      const hashedRefreshToken = refreshToken.refreshToken
      const comparedRefreshToken = await this.compareRefreshToken(token, hashedRefreshToken)
      if (!comparedRefreshToken) {
        throw new HttpException('Refresh token comparison failed', HttpStatus.UNAUTHORIZED)
      }

      if (refreshToken.invalidAt) {
        throw new HttpException('Refresh token invalidated', HttpStatus.FORBIDDEN)
      }
      if (refreshToken.usedAt) {
        await this.invalidateRefreshTokens(refreshToken.auth0Id)
        throw new HttpException('Refresh token used', HttpStatus.FORBIDDEN)
      }

      await this.markRefreshTokenAsUsed(hashedRefreshToken)
      await this.createOperatorJwtTokens(refreshToken.auth0Id, response)

      response.status(200).send()
    } catch (error) {
      this.logger.error(`Failed to validate operator refresh token: ${error.message}`)
      throw error
    }
  }

  async createOperatorJwtTokens (auth0Id: string, response: Response) {
    const tenMinutesInSeconds = 10 * 60
    const oneDayInSeconds = 24 * 60 * 60
    const milliseconds = 1000

    const accessToken = this.jwtService.sign(
      {
        sub: auth0Id
      },
      {
        secret: this.configService.get('SMART_WALLETS_JWT_SECRET'),
        expiresIn: tenMinutesInSeconds
      }
    )
    const refreshToken = this.jwtService.sign(
      {
        sub: auth0Id
      },
      {
        secret: this.configService.get('OPERATOR_REFRESH_JWT_SECRET'),
        expiresIn: oneDayInSeconds
      }
    )

    response.cookie('operator_access_token', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: tenMinutesInSeconds * milliseconds,
      sameSite: this.configService.get('CONSOLE_DAPP_URL') ? 'lax' : 'none'
    })
    response.cookie('operator_refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: oneDayInSeconds * milliseconds,
      sameSite: this.configService.get('CONSOLE_DAPP_URL') ? 'lax' : 'none'
    })

    const hashedRefreshToken = await this.hashRefreshToken(refreshToken)
    return this.createRefreshToken(auth0Id, hashedRefreshToken)
  }
}
