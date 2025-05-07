import { Body, Controller, Get, Head, Logger, Param, Post, Req, Res, UseGuards } from '@nestjs/common'
import { User } from '@app/accounts-service/users/user.decorator'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { CreateOperatorUserDto } from '@app/accounts-service/operators/dto/create-operator-user.dto'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'
import { Request, Response } from 'express'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'
import { MessagePattern } from '@nestjs/microservices'
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { AuthOperator } from '@app/accounts-service/operators/entities/auth-operator.entity'
import { CreateOperatorUser } from '@app/accounts-service/operators/entities/create-operator-user.entity'
import { CreateOperatorWalletDto } from '@app/accounts-service/operators/dto/create-operator-wallet.dto'
import { CreateOperatorCheckoutDto } from '@app/accounts-service/operators/dto/create-operator-checkout.dto'
import { ChargeCheckoutWebhookEvent } from '@app/accounts-service/operators/interfaces/charge-checkout-webhook-event.interface'
import { CreateChargeBridgeDto } from '@app/accounts-service/operators/dto/create-charge-bridge.dto'
import { CreateOperatorWallet } from '@app/accounts-service/operators/entities/create-operator-wallet.entity'
import { CronGuard } from '@app/accounts-service/auth/guards/cron.guard'

@ApiTags('Operators')
@Controller({ path: 'operators', version: '1' })
export class OperatorsController {
  private readonly logger = new Logger(OperatorsController.name)
  constructor (
    private readonly operatorsService: OperatorsService
  ) { }

  /**
   * Check if operator exist
   * @param Address
   */
  @Head('/eoaAddress/:address')
  @ApiOperation({ summary: 'Check if operator exist' })
  @ApiParam({ name: 'address', type: String, required: true })
  @ApiCreatedResponse({ description: 'Operator exist' })
  @ApiNotFoundResponse({ description: 'Operator does not exist' })
  async checkOperatorExistence (@Param('address') address: string, @Res() response: Response) {
    const statusCode = await this.operatorsService.checkOperatorExistenceByEoaAddress(address)
    response.status(statusCode).send()
  }

  /**
   * Validate operator
   * @param authOperatorDto
   * @returns the new operator JWT
   */
  @Post('/validate')
  @ApiOperation({ summary: 'Validate operator' })
  @ApiBody({ type: AuthOperator, required: true })
  @ApiCreatedResponse({ description: 'The operator has been successfully validated.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  validate (@Body() authOperatorDto: AuthOperatorDto, @Res({ passthrough: true }) response: Response) {
    return this.operatorsService.validate(authOperatorDto, response)
  }

  /**
   * Get current operator
   * @param authOperatorDto
   * @returns the user and project with public key
   */
  @UseGuards(JwtAuthGuard)
  @Get('/account')
  @ApiOperation({ summary: 'Get current operator' })
  @ApiCreatedResponse({ description: 'The operator has been successfully fetched.' })
  async getOperatorsUserAndProject (@User('sub') auth0Id: string) {
    return this.operatorsService.getOperatorUserAndProject(auth0Id)
  }

  /**
   * Create user and project for an operator
   * @param authOperatorDto
   * @returns the user and project with public key
   */
  @UseGuards(JwtAuthGuard)
  @Post('/account')
  @ApiOperation({ summary: 'Create user, project and AA wallet for an operator' })
  @ApiBody({ type: CreateOperatorUser, required: true })
  async createOperatorUserAndProjectAndWallet (@Body() createOperatorUserDto: CreateOperatorUserDto, @User('sub') auth0Id: string) {
    return this.operatorsService.createOperatorUserAndProjectAndWallet(createOperatorUserDto, auth0Id)
  }

  /**
   * Create AA wallet for an operator
   * @param authOperatorDto
   * @returns the AA wallet
   */
  @UseGuards(JwtAuthGuard)
  @Post('/wallet')
  @ApiOperation({ summary: 'Create AA wallet for an operator' })
  @ApiBody({ type: CreateOperatorWallet, required: true })
  async createOperatorWallet (@Body() createOperatorWalletDto: CreateOperatorWalletDto, @User('sub') auth0Id: string) {
    return this.operatorsService.createOperatorWallet(createOperatorWalletDto, auth0Id)
  }

  /**
   * Migrate Etherspot AA wallet to SAFE for an operator
   * @param authOperatorDto
   * @returns the SAFE AA wallet
   */
  @UseGuards(JwtAuthGuard)
  @Post('/migrate-wallet')
  @ApiOperation({ summary: 'Migrate Etherspot AA wallet to SAFE for an operator' })
  @ApiBody({ type: CreateOperatorWallet, required: true })
  async migrateOperatorWallet (@Body() migrateOperatorWalletDto: CreateOperatorWalletDto, @User('sub') auth0Id: string) {
    return this.operatorsService.migrateOperatorWallet(migrateOperatorWalletDto, auth0Id)
  }

  /**
   * Handle Webhook Receive And Fund Paymaster
   */
  @Post('/webhook/fund')
  @ApiOperation({ summary: 'Handle Webhook Receive And Fund Paymaster' })
  @ApiCreatedResponse({ description: 'The webhook event has been successfully handled.' })
  async handleWebhookReceiveAndFundPaymaster (@Body() webhookEvent: WebhookEvent) {
    return await this.operatorsService.handleWebhookReceiveAndFundPaymasterAndDeleteWalletAddressFromOperatorsWebhook(webhookEvent)
  }

  /**
   * Check if operator wallet is activated
   * @returns OK if operator wallet is activated, not found otherwise
   */
  @UseGuards(JwtAuthGuard)
  @Get('/is-activated')
  @ApiOperation({ summary: 'Check if operator wallet is activated' })
  @ApiCreatedResponse({ description: 'Wallet is activated' })
  @ApiNotFoundResponse({ description: 'Wallet not activated' })
  async checkWalletActivationStatus (@User('sub') auth0Id: string, @Res() response: Response) {
    const isActivated = await this.operatorsService.checkWalletActivationStatus(auth0Id)
    if (!isActivated) {
      return response.status(404).send({ message: 'Wallet not activated' })
    }
    return response.status(200).send({ message: 'Wallet is activated' })
  }

  /**
   * Get sponsored transactions count
   * @param authOperatorDto
   * @returns sponsored transactions count
   */
  @UseGuards(JwtAuthGuard)
  @Get('/sponsored-transaction')
  @ApiOperation({ summary: 'Get sponsored transactions count' })
  @ApiCreatedResponse({ description: 'The sponsored transactions count has been successfully fetched.' })
  async getSponsoredTransactionsCount (@User('sub') auth0Id: string) {
    return this.operatorsService.getSponsoredTransactionsCount(auth0Id)
  }

  // Endpoint for microservice interaction
  @MessagePattern('find-operator-by-smart-wallet')
  async findOperatorBySmartWallet (walletAddress: string) {
    return this.operatorsService.findOperatorBySmartWallet(walletAddress)
  }

  @MessagePattern('find-operator-by-owner-id')
  async findOperatorByOwnerId (walletAddress: string) {
    return this.operatorsService.findWalletOwner(walletAddress)
  }

  /**
   * Refresh operator token
   * @returns new access and refresh JWTs of the operator
   */
  @Post('/refresh-token')
  @ApiOperation({ summary: 'Refresh operator token' })
  refreshToken (@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.operatorsService.validateRefreshToken(request.cookies?.operator_refresh_token, response)
  }

  /**
   * Create a subscription for the operator
   * @param createSubscriptionDto
   * @returns the subscription
   */
  @UseGuards(JwtAuthGuard)
  @Post('/subscriptions')
  @ApiOperation({ summary: 'Create a subscription for the operator' })
  async createSubscription (@User('sub') auth0Id: string) {
    return this.operatorsService.createSubscription(auth0Id)
  }

  /**
   * Get all subscription invoices for the operator
   * @returns the subscription invoices
   */
  @UseGuards(JwtAuthGuard)
  @Get('/subscriptions')
  @ApiOperation({ summary: 'Get all subscription invoices for the operator' })
  async getSubscriptions (@User('sub') auth0Id: string) {
    return this.operatorsService.getSubscriptions(auth0Id)
  }

  /**
   * Create a checkout session for the operator
   * @returns the checkout URL
   */
  @UseGuards(JwtAuthGuard)
  @Post('/checkout/sessions')
  @ApiOperation({ summary: 'Create a checkout session for the operator' })
  async checkoutSession (@User('sub') auth0Id: string, @Body() createOperatorCheckoutDto: CreateOperatorCheckoutDto) {
    return this.operatorsService.checkout(auth0Id, createOperatorCheckoutDto)
  }

  /**
   * Get all checkout sessions for the operator
   * @returns checkout sessions
   */
  @UseGuards(JwtAuthGuard)
  @Get('/checkout/sessions')
  @ApiOperation({ summary: 'Get all checkout sessions for the operator' })
  async getCheckoutSessions (@User('sub') auth0Id: string) {
    return this.operatorsService.getCheckoutSessions(auth0Id)
  }

  /**
   * Handle the checkout webhook
   */
  @Post('/checkout/webhook')
  @ApiOperation({ summary: 'Handle the checkout webhook' })
  async handleCheckoutWebhook (@Body() webhookEvent: ChargeCheckoutWebhookEvent) {
    return this.operatorsService.handleCheckoutWebhook(webhookEvent)
  }

  /**
   * Create a Charge bridge wallet address for operator deposit
   * @param chargeBridgeDto
   * @returns the Charge bridge deposit wallet address
   */
  @UseGuards(JwtAuthGuard)
  @Post('/bridge')
  @ApiOperation({ summary: 'Create a Charge bridge wallet address for operator deposit' })
  async createChargeBridge (@User('sub') auth0Id: string, @Body() createChargeBridgeDto: CreateChargeBridgeDto) {
    return this.operatorsService.createChargeBridge(auth0Id, createChargeBridgeDto)
  }

  /**
   * Trigger the process of monthly subscriptions
   */
  @UseGuards(CronGuard)
  @Post('/subscriptions/process')
  @ApiOperation({ summary: 'Trigger the process of monthly subscriptions' })
  async processMonthlySubscriptions () {
    return this.operatorsService.processMonthlySubscriptions()
  }
}
