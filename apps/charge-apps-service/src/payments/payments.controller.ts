import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { CreatePaymentLinkDto } from '@app/apps-service/payments/dto/create-payment-link.dto'
import { PaymentsService } from '@app/apps-service/payments/payments.service'
import { MessagePattern } from '@nestjs/microservices'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'
import { IsValidApiKeysGuard } from '@app/apps-service/api-keys/guards/is-valid-api-keys.guard'
import { UserId } from '@app/apps-service/common/config/decorators/user.decorator'
import { TransferTokensDto } from '@app/apps-service/payments/dto/transfer-tokens.dto'

@Controller('payments')
export class PaymentsController {
  constructor (private readonly paymentsService: PaymentsService) { }

  @UseGuards(IsValidApiKeysGuard)
  @Get('payment_link/allowed_tokens')
  @MessagePattern('get_allowed_tokens')
  getAllowedTokens () {
    return this.paymentsService.getPaymentsAllowedTokens()
  }

  @MessagePattern('create_payment_account')
  createPaymentAccount (ownerId: string) {
    return this.paymentsService.createPaymentAccount(ownerId)
  }

  @UseGuards(IsValidApiKeysGuard)
  @Post('payment_link')
  @MessagePattern('create_payment_link')
  createPaymentLink (@UserId() userId: string, @Body() createPaymentLinkDto: CreatePaymentLinkDto) {
    return this.paymentsService.createPaymentLink(userId, createPaymentLinkDto)
  }

  @Get('payment_link/:paymentLinkId')
  getPaymentLink (@Param('paymentLinkId') paymentLinkId: string) {
    return this.paymentsService.getPaymentLink(paymentLinkId)
  }

  @UseGuards(IsValidApiKeysGuard)
  @Get('payment_links')
  @MessagePattern('get_payment_links')
  getPaymentLinks (@UserId() userId: string, @Body() ownerId: string) {
    return this.paymentsService.getPaymentLinks(userId || ownerId)
  }

  @Post('webhook')
  webhook (@Body() webhookEvent: WebhookEvent) {
    return this.paymentsService.handleWebhook(webhookEvent)
  }

  @UseGuards(IsValidApiKeysGuard)
  @Get('account_balance')
  @MessagePattern('get_wallet_balance')
  getWalletBalance (@UserId() userId: string, @Body() ownerId: string) {
    return this.paymentsService.getWalletBalance(userId || ownerId)
  }

  @MessagePattern('transfer_tokens')
  transferTokens (@Body() transferTokensDto: TransferTokensDto) {
    return this.paymentsService.transferTokens(transferTokensDto)
  }
}
