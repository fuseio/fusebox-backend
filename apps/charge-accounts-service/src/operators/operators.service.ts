import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ethers } from 'ethers'
import { networkService, notificationsService, smartWalletsService } from '@app/common/constants/microservices.constants'
import { PaymasterService } from '@app/accounts-service/paymaster/paymaster.service'
import { UsersService } from '@app/accounts-service/users/users.service'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'
import paymasterAbi from '@app/api-service/paymaster-api/abi/FuseVerifyingPaymasterSingleton.abi.json'
import etherspotWalletFactoryAbi from '@app/accounts-service/operators/abi/EtherspotWalletFactory.abi.json'
import { ConfigService } from '@nestjs/config'
import { CreateOperatorUserDto } from '@app/accounts-service/operators/dto/create-operator-user.dto'
import { OperatorWallet } from '@app/accounts-service/operators/interfaces/operator-wallet.interface'
import { operatorInvoiceModelString, operatorWalletModelString } from '@app/accounts-service/operators/operators.constants'
import { Model, ObjectId } from 'mongoose'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { ClientProxy } from '@nestjs/microservices'
import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'
import { AnalyticsService } from '@app/common/services/analytics.service'
import axios from 'axios'
import { CreateOperatorInvoiceDto } from '@app/accounts-service/operators/dto/create-operator-invoice.dto'
import { OPERATOR_PLANS } from '@app/accounts-service/operators/config/operators-plans'
import { OPERATOR_PAYMENT_METHODS } from '@app/accounts-service/operators/config/operators-payment-methods'
import BigNumber from 'bignumber.js'
import { OperatorInvoice } from '@app/accounts-service/operators/interfaces/operator-invoice.interface'

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
    @Inject(networkService)
    private readonly networkClient: ClientProxy,
    private readonly analyticsService: AnalyticsService,
    @Inject(operatorInvoiceModelString)
    private operatorInvoiceModel: Model<OperatorInvoice>
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
      const projectObject = await this.createProject(user, createOperatorUserDto)
      const publicKey = await this.projectsService.getPublic(projectObject._id)
      const secretKey = await this.createProjectSecret(projectObject)
      const sponsorId = await this.createPaymasters(projectObject)
      const predictedWallet = await this.predictWallet(auth0Id, 0, '0_1_0', 'production')
      const eventData = {
        email: user.email,
        apiKey: publicKey
      }
      await this.createOperatorWallet(user, predictedWallet)
      await this.addAddressToOperatorsWebhook(predictedWallet)
      await this.addAddressToTokenReceiveWebhook(predictedWallet)
      this.googleFormSubmit(createOperatorUserDto)
      this.analyticsService.trackEvent('New Operator Created', { ...eventData }, { user_id: user?.auth0Id })
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
      this.logger.error(`Operator service error: ${error.getResponse()}`)
      throw new InternalServerErrorException(error.message)
    } else {
      this.logger.error(`Operator service error: ${error.message}`)
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

  private async getUserOrThrow (auth0Id: string) {
    const user = await this.usersService.findOneByAuth0Id(auth0Id)
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    return user
  }

  private async getWalletOrThrow (userId: string) {
    const wallet = await this.findWalletOwner(userId)
    if (!wallet) throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND)
    return wallet
  }

  private async getPaymentMethodOrThrow (paymentMethodId: string) {
    const paymentMethod = OPERATOR_PAYMENT_METHODS.find(method => method.id === paymentMethodId)
    if (!paymentMethod) throw new HttpException('Payment Method not found', HttpStatus.NOT_FOUND)
    return paymentMethod
  }

  private async getPricingPlanOrThrow (pricingPlanId: string) {
    const pricingPlan = OPERATOR_PLANS.find(plan => plan.id === pricingPlanId)
    if (!pricingPlan) throw new HttpException('Pricing Plan not found', HttpStatus.NOT_FOUND)
    return pricingPlan
  }

  async findLastOperatorInvoiceByOperatorId (operatorId: string): Promise<OperatorInvoice> {
    return this.operatorInvoiceModel.findOne({ operatorId }).sort({ subscriptionEndedAt: -1 })
  }

  private async getTransactionInfo (transactionHash: string) {
    return callMSFunction(this.networkClient, 'get_transaction_info', transactionHash.toLowerCase())
  }

  async createOperatorInvoice (createOperatorInvoiceDto: CreateOperatorInvoiceDto, auth0Id: string) {
    try {
      const user = await this.getUserOrThrow(auth0Id)
      const wallet = await this.getWalletOrThrow(user._id)
      const lastInvoice = await this.findLastOperatorInvoiceByOperatorId(wallet.ownerId)

      const paymentMethod = await this.getPaymentMethodOrThrow(createOperatorInvoiceDto.paymentMethodId)
      const pricingPlan = await this.getPricingPlanOrThrow(createOperatorInvoiceDto.pricingPlanId)

      const transactionInfo = await this.getTransactionInfo(createOperatorInvoiceDto.transactionHash)

      await this.validateTransaction(transactionInfo, paymentMethod, pricingPlan)

      const invoice = this.createInvoiceObject(wallet, paymentMethod, pricingPlan, createOperatorInvoiceDto, lastInvoice)

      await this.saveInvoice(invoice)

      this.trackInvoiceCreation(invoice, user)

      return invoice
    } catch (error) {
      this.errorHandler(error)
    }
  }

  private async validateTransaction (transactionInfo: any, paymentMethod: any, pricingPlan: any) {
    if (transactionInfo.confirmations && transactionInfo.confirmations < 1) {
      throw new HttpException('Transaction not confirmed on blockchain', HttpStatus.BAD_REQUEST)
    }

    const tokenAddress = transactionInfo.token_transfers?.[0]?.token?.address || '0x0000000000000000000000000000000000000000'
    if (tokenAddress.toLowerCase() !== paymentMethod.tokenAddress.toLowerCase()) {
      throw new HttpException('Transaction token does not match the payment method', HttpStatus.BAD_REQUEST)
    }
    const rawValue = transactionInfo.token_transfers?.[0]?.total?.value || transactionInfo.value
    const decimals = paymentMethod.tokenDecimal || 18
    const totalValue = new BigNumber(rawValue).dividedBy(10 ** decimals).toNumber()
    if (totalValue < pricingPlan.priceInUsd) {
      throw new HttpException('Transaction amount does not match the pricing plan', HttpStatus.BAD_REQUEST)
    }
  }

  private createInvoiceObject (wallet: any, paymentMethod: any, pricingPlan: any, createOperatorInvoiceDto: CreateOperatorInvoiceDto, lastInvoice: any) {
    const subscriptionStartedAt = lastInvoice ? lastInvoice.subscriptionEndedAt : new Date()
    const subscriptionEndedAt = new Date(subscriptionStartedAt.getTime() + pricingPlan.duration)

    return {
      operatorId: wallet.ownerId,
      paymentMethod,
      pricingPlan,
      transactionHash: createOperatorInvoiceDto.transactionHash.toLowerCase(),
      subscriptionStartedAt,
      subscriptionEndedAt
    }
  }

  private async saveInvoice (invoice: any) {
    const operatorInvoiceCreated = await this.operatorInvoiceModel.create(invoice)
    if (!operatorInvoiceCreated) {
      throw new HttpException('Failed to create operator invoice', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return operatorInvoiceCreated
  }

  private trackInvoiceCreation (invoice: any, user: any) {
    this.analyticsService.trackEvent('Operator Invoice Created', { ...invoice }, { user_id: user?.auth0Id })
  }

  async getOperatorInvoices (auth0Id: string): Promise<OperatorInvoice[]> {
    const user = await this.getUserOrThrow(auth0Id)
    const invoices = await this.operatorInvoiceModel.find({ operatorId: user._id }).sort({ createdAt: -1 }).exec()
    if (!invoices || invoices.length === 0) {
      throw new NotFoundException(`No invoices found for operator ${user._id}`)
    }
    return invoices
  }

  async getBillingPlans () {
    return OPERATOR_PLANS
  }

  async getPaymentMethods () {
    return OPERATOR_PAYMENT_METHODS
  }
}
