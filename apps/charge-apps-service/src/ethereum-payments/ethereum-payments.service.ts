import { walletTypes } from '@app/apps-service/charge-api/schemas/backend-wallet.schema'
import { CreateEthereumPaymentLinkDto } from '@app/apps-service/ethereum-payments/dto/create-ethereum-payment-link.dto'
import { TransferTokensEthereumDto } from '@app/apps-service/ethereum-payments/dto/transfer-tokens-ethereum.dto'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { isEmpty } from 'lodash'
import { Model } from 'mongoose'
import { BackendWalletsEthereumService } from '@app/apps-service/ethereum-payments/backend-wallets-ethereum.service'
import { EthereumPaymentAccount } from '@app/apps-service/ethereum-payments/interfaces/ethereum-payment-account.interface'
import { EthereumPaymentLink } from '@app/apps-service/ethereum-payments/interfaces/ethereum-payment-link.interface'
import { ethereumPaymentAccountModelString, ethereumPaymentLinkModelString } from '@app/apps-service/ethereum-payments/ethereum-payments.constants'

@Injectable()
export class EthereumPaymentsService {
  private readonly logger = new Logger(EthereumPaymentsService.name)

  constructor (
        private backendWalletEthereumService: BackendWalletsEthereumService,
        @Inject(ethereumPaymentAccountModelString)
        private paymentAccountModel: Model<EthereumPaymentAccount>,
        @Inject(ethereumPaymentLinkModelString)
        private paymentLinkModel: Model<EthereumPaymentLink>,
        private readonly configService: ConfigService
  ) { }

  get networkName () {
    return this.configService.get('NETWORK_NAME')
  }
  
  get allowedPaymentTokens () {
    return this.configService.get(`${this.networkName}PaymentsAllowedTokens`)
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

  isRequestedAllowedToken (createPaymentLinkEthereumDto: CreateEthereumPaymentLinkDto) {
    const isTokenAddressAllowed = this.allowedTokenAddresses.some(address => {
      return address.toLowerCase() === createPaymentLinkEthereumDto.tokenAddress.toLowerCase()
    })

    const isTokenSymbolAllowed = this.allowedTokenSymbols.some(symbol => {
      return symbol.toLowerCase() === createPaymentLinkEthereumDto.tokenSymbol.toLowerCase()
    })

    return isTokenAddressAllowed && isTokenSymbolAllowed
  }

  async createPaymentAccount (ownerId: string) {
    const backendWallet = await this.backendWalletEthereumService.createBackendWallet(walletTypes.PAYMENT_ACCOUNT)

    const paymentAccount = await this.paymentAccountModel.create({
      ownerId, backendWalletId: backendWallet._id
    })

    paymentAccount.save()

    return paymentAccount
  }

  async createPaymentLink (userId: string, createPaymentLinkEthereumDto: CreateEthereumPaymentLinkDto) {
    if (isEmpty(createPaymentLinkEthereumDto.ownerId)) {
        createPaymentLinkEthereumDto.ownerId = userId
    }

    if (!this.isRequestedAllowedToken(createPaymentLinkEthereumDto)) {
      throw new HttpException(
                `${createPaymentLinkEthereumDto.tokenSymbol} - ${createPaymentLinkEthereumDto.tokenAddress} is not allowed`,
                HttpStatus.BAD_REQUEST
      )
    }

    const backendWallet = await this.backendWalletEthereumService.createBackendWallet(walletTypes.PAYMENT_LINK)

    createPaymentLinkEthereumDto.backendWalletId = backendWallet._id

    const paymentLink = await this.paymentLinkModel.create(createPaymentLinkEthereumDto)

    paymentLink.save()

    await this.backendWalletEthereumService.addWebhookAddress(backendWallet.walletAddress)

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
    
  }

  async transferTokens (transferTokensEthereumDto: TransferTokensEthereumDto) {
    
  }

  async handleWebhook (webhookEvent: WebhookEvent) {
  }
}
