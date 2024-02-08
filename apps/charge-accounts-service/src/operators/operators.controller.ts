import { Body, Controller, Get, Head, Logger, Param, Post, Res, UseGuards } from '@nestjs/common'
import { User } from '@app/accounts-service/users/user.decorator'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { CreateOperatorUserDto } from '@app/accounts-service/operators/dto/create-operator-user.dto'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'
import { Response } from 'express'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'

@Controller({ path: 'operators', version: '1' })
export class OperatorsController {
  private readonly logger = new Logger(OperatorsController.name)
  constructor(
    private readonly operatorsService: OperatorsService,
  ) { }

  /**
   * Check if operator exist
   * @param Address
   */
  @Head('/eoaAddress/:address')
  async checkOperatorExistence(@Param('address') address: string, @Res() response: Response) {
    const statusCode = await this.operatorsService.checkOperatorExistenceByEoaAddress(address);
    response.status(statusCode).send();
  }

  /**
   * Validate operator
   * @param authOperatorDto
   * @returns the new operator JWT
   */
  @Post('/validate')
  validate(@Body() authOperatorDto: AuthOperatorDto) {
    return this.operatorsService.validate(authOperatorDto)
  }

  /**
   * Get current operator
   * @param authOperatorDto
   * @returns the user and project with public key
   */
  @UseGuards(JwtAuthGuard)
  @Get('/account')
  async getOperatorsUserAndProject(@User('sub') auth0Id: string) {
    return this.operatorsService.getOperatorUserAndProject(auth0Id)
  }

  /**
   * Create user, project and AA wallet for an operator
   * @param authOperatorDto
   * @returns the user, project and AA wallet with public key
   */
  @UseGuards(JwtAuthGuard)
  @Post('/account')
  async createOperatorUserAndProjectAndWallet(@Body() createOperatorUserDto: CreateOperatorUserDto, @User('sub') auth0Id: string) {
    return this.operatorsService.createOperatorUserAndProjectAndWallet(createOperatorUserDto, auth0Id)
  }

  /**
   * Handle Webhook Receive And Fund Paymaster
   */
  @Post('/webhook/fund')
  async handleWebhookReceiveAndFundPaymaster(@Body() webhookEvent: WebhookEvent) {
    return await this.operatorsService.handleWebhookReceiveAndFundPaymasterAndDeleteWalletAddressFromOperatorsWebhook(webhookEvent)
  }

  /**
   * Check if operator wallet is activated
   * @returns OK if operator wallet is activated, not found otherwise
   */
  @UseGuards(JwtAuthGuard)
  @Get('/is-activated')
  async checkWalletActivationStatus(@User('sub') auth0Id: string, @Res() response: Response) {
    const isActivated = await this.operatorsService.checkWalletActivationStatus(auth0Id);
    if (!isActivated) {
      return response.status(404).send({ message: 'Wallet not activated' });
    }
    return response.status(200).send({ message: 'Wallet is activated' });
  }

  /**
   * Get sponsored transactions count
   * @param authOperatorDto
   * @returns sponsored transactions count
   */
  @UseGuards(JwtAuthGuard)
  @Get('/sponsored-transaction')
  async getSponsoredTransactionsCount(@User('sub') auth0Id: string) {
    return this.operatorsService.getSponsoredTransactionsCount(auth0Id)
  }
}
