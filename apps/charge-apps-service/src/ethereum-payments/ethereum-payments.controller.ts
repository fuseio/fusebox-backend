import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { CreatePaymentLinkDto } from '@app/apps-service/payments/dto/create-payment-link.dto'
import { EthereumPaymentsService } from '@app/apps-service/ethereum-payments/ethereum-payments.service'
import { MessagePattern } from '@nestjs/microservices'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'
import { IsValidApiKeysGuard } from '@app/apps-service/api-keys/guards/is-valid-api-keys.guard'
import { UserId } from '@app/apps-service/common/config/decorators/user.decorator'
@Controller('payments_ethereum')
export class EthereumPaymentsController {
  constructor (private readonly paymentsEthereumService: EthereumPaymentsService) { }

  @UseGuards(IsValidApiKeysGuard)
  @Get('payment_link/allowed_tokens')
  getAllowedTokens () {
    return this.paymentsEthereumService.getPaymentsAllowedTokens()
  }

  @UseGuards(IsValidApiKeysGuard)
  @Post('payment_account')
  createPaymentAccount (ownerId: string) {
    return this.paymentsEthereumService.createPaymentAccount(ownerId)
  }

  @UseGuards(IsValidApiKeysGuard)
  @Post('payment_link')
  createPaymentLink (@UserId() userId: string, @Body() createPaymentLinkDto: CreatePaymentLinkDto) {
    return this.paymentsEthereumService.createPaymentLink(userId, createPaymentLinkDto)
  }

  @Get('payment_link/:paymentLinkId')
  getPaymentLink (@Param('paymentLinkId') paymentLinkId: string) {
    return this.paymentsEthereumService.getPaymentLink(paymentLinkId)
  }

  @UseGuards(IsValidApiKeysGuard)
  @Get('payment_links')
  getPaymentLinks (@UserId() userId: string, @Body() ownerId: string) {
    return this.paymentsEthereumService.getPaymentLinks(userId || ownerId)
  }

  @Post('webhook')
  webhook (@Body() webhookEvent: WebhookEvent) {
    return this.paymentsEthereumService.handleWebhook(webhookEvent)
  }
}
