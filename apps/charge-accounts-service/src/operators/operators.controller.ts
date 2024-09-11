import { Body, Controller, Get, Head, Logger, Param, Post, Res, UseGuards } from '@nestjs/common'
import { User } from '@app/accounts-service/users/user.decorator'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { CreateOperatorUserDto } from '@app/accounts-service/operators/dto/create-operator-user.dto'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'
import { Response } from 'express'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'
import { MessagePattern } from '@nestjs/microservices'
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { AuthOperator } from '@app/accounts-service/operators/entities/auth-operator.entity'
import { CreateOperatorUser } from '@app/accounts-service/operators/entities/create-operator-user.entity'
import { CreateOperatorInvoice } from '@app/accounts-service/operators/entities/create-operator-invoice.entity'
import { CreateOperatorInvoiceDto } from '@app/accounts-service/operators/dto/create-operator-invoice.dto'

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
  validate (@Body() authOperatorDto: AuthOperatorDto) {
    return this.operatorsService.validate(authOperatorDto)
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
   * Create user, project and AA wallet for an operator
   * @param authOperatorDto
   * @returns the user, project and AA wallet with public key
   */
  @UseGuards(JwtAuthGuard)
  @Post('/account')
  @ApiOperation({ summary: 'Create user, project and AA wallet for an operator' })
  @ApiBody({ type: CreateOperatorUser, required: true })
  async createOperatorUserAndProjectAndWallet (@Body() createOperatorUserDto: CreateOperatorUserDto, @User('sub') auth0Id: string) {
    return this.operatorsService.createOperatorUserAndProjectAndWallet(createOperatorUserDto, auth0Id)
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
   * Create invoice for an operator
   * @param createOperatorInvoiceDto
   * @returns invoice id
   */
  @UseGuards(JwtAuthGuard)
  @Post('/invoice')
  @ApiOperation({ summary: 'Create invoice for an operator' })
  @ApiBody({ type: CreateOperatorInvoice, required: true })
  async createOperatorInvoice (@Body() createOperatorInvoiceDto: CreateOperatorInvoiceDto, @User('sub') auth0Id: string) {
    return this.operatorsService.createOperatorInvoice(createOperatorInvoiceDto, auth0Id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/invoice')
  async getOperatorInvoices (@User('sub') auth0Id: string) {
    return this.operatorsService.getOperatorInvoices(auth0Id)
  }

  @Get('billing-plans')
  async getBillingPlans () {
    return this.operatorsService.getBillingPlans()
  }

  @Get('payment-methods')
  async getPaymentMethods () {
    return this.operatorsService.getPaymentMethods()
  }
}
