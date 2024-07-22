import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { CreatePaymentLinkDto } from '@app/apps-service/payments/dto/create-payment-link.dto'
import { ChargeApiService } from '@app/apps-service/charge-api/charge-api.service'
import { paymentAccountModelString, paymentLinkModelString } from '@app/apps-service/payments/payments.constants'
import { Model } from 'mongoose'
import { PaymentAccount } from '@app/apps-service/payments/interfaces/payment-account.interface'
import { PaymentLink } from '@app/apps-service/payments/interfaces/payment-link.interface'
import { walletTypes } from '@app/apps-service/charge-api/schemas/backend-wallet.schema'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'
import { status } from '@app/apps-service/payments/schemas/payment-link.schema'
import { ConfigService } from '@nestjs/config'
import { BackendWallet } from '@app/apps-service/charge-api/interfaces/backend-wallet.interface'
import { isEmpty } from 'lodash'
import { TransferTokensDto } from '@app/apps-service/payments/dto/transfer-tokens.dto'
import WebhookSendService from '@app/common/services/webhook-send.service'

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)

  constructor (
    private chargeApiService: ChargeApiService,
    @Inject(paymentAccountModelString)
    private paymentAccountModel: Model<PaymentAccount>,
    @Inject(paymentLinkModelString)
    private paymentLinkModel: Model<PaymentLink>,
    private readonly configService: ConfigService,
    private readonly webhookSendService: WebhookSendService
  ) { }

  get allowedPaymentTokens () {
    return this.configService.get('paymentsAllowedTokens')
  }

  get chargePaymentLinksWebhookId () {
    return this.configService.get('CHARGE_WEBHOOK_ID')
  }

  get allowedTokenAddresses () {
    return this.allowedPaymentTokens.map(token => token.tokenAddress)
  }

  get allowedTokenSymbols () {
    return this.allowedPaymentTokens.map(token => token.tokenSymbol)
  }

  async getPaymentsAllowedTokens () {
    return this.configService.get('paymentsAllowedTokens')
  }

  isRequestedAllowedToken (createPaymentLinkDto: CreatePaymentLinkDto) {
    const isTokenAddressAllowed = this.allowedTokenAddresses.some(address => {
      return address.toLowerCase() === createPaymentLinkDto.tokenAddress.toLowerCase()
    })

    const isTokenSymbolAllowed = this.allowedTokenSymbols.some(symbol => {
      return symbol.toLowerCase() === createPaymentLinkDto.tokenSymbol.toLowerCase()
    })

    return isTokenAddressAllowed && isTokenSymbolAllowed
  }

  async createPaymentAccount (ownerId: string) {
    const backendWallet = await this.chargeApiService.createBackendWallet(walletTypes.PAYMENT_ACCOUNT)

    const paymentAccount = await this.paymentAccountModel.create({
      ownerId, backendWalletId: backendWallet._id
    })

    paymentAccount.save()

    return paymentAccount
  }

  async createPaymentLink (userId: string, createPaymentLinkDto: CreatePaymentLinkDto) {
    if (isEmpty(createPaymentLinkDto.ownerId)) {
      createPaymentLinkDto.ownerId = userId
    }

    if (!this.isRequestedAllowedToken(createPaymentLinkDto)) {
      throw new HttpException(
        `${createPaymentLinkDto.tokenSymbol} - ${createPaymentLinkDto.tokenAddress} is not allowed`,
        HttpStatus.BAD_REQUEST
      )
    }

    const backendWallet = await this.chargeApiService.createBackendWallet(walletTypes.PAYMENT_LINK)

    createPaymentLinkDto.backendWalletId = backendWallet._id

    const paymentLink = await this.paymentLinkModel.create(createPaymentLinkDto)

    paymentLink.save()

    await this.chargeApiService.addWebhookAddress({
      walletAddress: backendWallet.walletAddress,
      webhookId: this.chargePaymentLinksWebhookId
    })

    return paymentLink
  }

  async getPaymentLink (paymentLinkId: string) {
    const paymentLink = await this.paymentLinkModel.findById(paymentLinkId).populate('backendWalletId', 'walletAddress')

    if (isEmpty(paymentLink)) {
      throw new HttpException(`Payment link with id: ${paymentLinkId} was not found`,
        HttpStatus.NOT_FOUND)
    }
    return paymentLink
  }

  async getPaymentLinks (ownerId: string) {
    return this.paymentLinkModel.find({ ownerId })
  }

  async getWalletBalance (ownerId: string) {
    const paymentAccount = await this.paymentAccountModel.findOne({ ownerId })
      .populate<{ backendWalletId: BackendWallet }>('backendWalletId')

    return this.chargeApiService.getWalletBalance(paymentAccount.backendWalletId.walletAddress)
  }

  async transferTokens (transferTokensDto: TransferTokensDto) {
    if (isEmpty(transferTokensDto.from)) {
      const paymentAccount = await this.paymentAccountModel
        .findOne({ ownerId: transferTokensDto.ownerId })
        .populate<{ backendWalletId: BackendWallet }>('backendWalletId')

      transferTokensDto.from = paymentAccount.backendWalletId.walletAddress
    }

    return this.chargeApiService.transferTokens(transferTokensDto)
  }

  async handleWebhook (webhookEvent: WebhookEvent) {
    if (webhookEvent.direction === 'incoming') {
      const backendWallet = await this.chargeApiService.getBackendWalletByAddress(webhookEvent.to)
      const paymentLink = await this.paymentLinkModel.findOne({ backendWalletId: backendWallet._id })

      paymentLink.receivedAmount = webhookEvent.valueEth
      paymentLink.receivedTokenAddress = webhookEvent.tokenAddress
      paymentLink.receivedTokenSymbol = webhookEvent.tokenSymbol

      const amountFloat = paymentLink.amount
      const receivedAmountFloat = parseFloat(paymentLink.receivedAmount)

      if (!this.isTokenMatch(paymentLink, webhookEvent)) {
        paymentLink.status = status.WRONG_TOKEN
      } else if (receivedAmountFloat === amountFloat) {
        paymentLink.status = status.SUCCESSFUL
      } else if (receivedAmountFloat > amountFloat) {
        paymentLink.status = status.OVERPAID
      } else {
        paymentLink.status = status.UNDERPAID
      }

      const ownerId = paymentLink.ownerId
      const paymentAccount = await this.paymentAccountModel.findOne({ ownerId })
        .populate<{ backendWalletId: BackendWallet }>('backendWalletId')

      this.transferTokens({
        tokenAddress: paymentLink.receivedTokenAddress,
        from: backendWallet.walletAddress,
        to: paymentAccount.backendWalletId.walletAddress,
        amount: paymentLink.receivedAmount
      } as TransferTokensDto).then((transferTokensRes) => {
        if (paymentLink.webhookUrl) {
          const paymentLinkWebhookEvent = [
            {
              status: paymentLink.status.toLowerCase(),
              from: webhookEvent.from,
              to: webhookEvent.to,
              txHash: webhookEvent.txHash,
              amount: webhookEvent.value
            },
            {
              status: transferTokensRes.data.status,
              from: transferTokensRes.data.data.wallet,
              to: transferTokensRes.data.data.to,
              txHash: transferTokensRes.data.data.txHash,
              amount: transferTokensRes.data.data.amount
            }
          ]
          this.webhookSendService.sendData(paymentLinkWebhookEvent, paymentLink.webhookUrl)
        }
      }).catch(err => {
        const errorMessage = `Failed to send funds to main account: ${err}`
        this.logger.error(errorMessage)
        throw new HttpException(
          errorMessage,
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      })

      await paymentLink.save()
    }
  }

  isTokenMatch (paymentLink: PaymentLink, webhookEvent: WebhookEvent) {
    return paymentLink.tokenAddress.toLowerCase() === webhookEvent.tokenAddress.toLowerCase() &&
      paymentLink.tokenSymbol.toLowerCase() === webhookEvent.tokenSymbol.toLowerCase()
  }
}
