import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { CreatePaymentLinkDto } from '@app/apps-service/payments/dto/create-payment-link.dto'
import { PaymentsService } from '@app/apps-service/payments/payments.service'
import { MessagePattern } from '@nestjs/microservices'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'

@Controller('payments')
export class PaymentsController {
  constructor (private readonly paymentsService: PaymentsService) { }

  @MessagePattern('get_allowed_tokens')
  getAllowedTokens() {
    return this.paymentsService.getPaymentsAllowedTokens()
  }
  
  @MessagePattern('create_payment_account')
  createPaymentAccount (ownerId: string) {
    return this.paymentsService.createPaymentAccount(ownerId)
  }

  // TODO: Add Auth Guard for API where we can get the ownerId also
  @Post('payment_link')
  @MessagePattern('create_payment_link')
  createPaymentLink (@Body() createPaymentLinkDto: CreatePaymentLinkDto) {
    return this.paymentsService.createPaymentLink(createPaymentLinkDto)
  }

  @Get('payment_link/:paymentLinkId') 
  getPaymentLink(@Param('paymentLinkId') paymentLinkId: string) {
    return this.paymentsService.getPaymentLink(paymentLinkId)
  }

  @MessagePattern('get_payment_links')
  getPaymentLinks (ownerId: string) {
    return this.paymentsService.getPaymentLinks(ownerId)
  }

  @Post('webhook') 
  webhook(@Body() webhookEvent: WebhookEvent) {
    this.paymentsService.handleWebhook(webhookEvent)
  }
}
