import { walletTypes } from '@app/apps-service/charge-api/schemas/backend-wallet.schema'
import { CreateEthereumPaymentLinkDto } from '@app/apps-service/ethereum-payments/dto/create-ethereum-payment-link.dto'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { isEmpty } from 'lodash'
import { Model } from 'mongoose'
import { BackendWalletsEthereumService } from '@app/apps-service/ethereum-payments/backend-wallets-ethereum.service'
import { EthereumPaymentAccount } from '@app/apps-service/ethereum-payments/interfaces/ethereum-payment-account.interface'
import { EthereumPaymentLink } from '@app/apps-service/ethereum-payments/interfaces/ethereum-payment-link.interface'
import { ethereumPaymentAccountModelString, ethereumPaymentLinkModelString } from '@app/apps-service/ethereum-payments/ethereum-payments.constants'
import { status } from '@app/apps-service/ethereum-payments/schemas/ethereum-payment-link.schema'
import { EthereumBackendWallet } from '@app/apps-service/ethereum-payments/interfaces/ethereum-backend-wallet.interface'
import { getAddress } from 'ethers'
import WebhookSendService from '@app/common/services/webhook-send.service'

@Injectable()
export class EthereumPaymentsService {
  private readonly logger = new Logger(EthereumPaymentsService.name)

  constructor (
    private backendWalletEthereumService: BackendWalletsEthereumService,
    @Inject(ethereumPaymentAccountModelString)
    private paymentAccountModel: Model<EthereumPaymentAccount>,
    @Inject(ethereumPaymentLinkModelString)
    private paymentLinkModel: Model<EthereumPaymentLink>,
    private readonly configService: ConfigService,
    private readonly webhookSendService: WebhookSendService
  ) { }

  get networkName () {
    return this.configService.get('ETHEREUM_PAYMENTS_NETWORK_NAME')
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
    return this.allowedPaymentTokens
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

    return paymentLink.populate<{ backendWalletId: EthereumBackendWallet }>('backendWalletId')
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

  async handleWebhook (webhookEvent: any) {
    const toAddress = getAddress(webhookEvent.event.activity[0].toAddress)
    const fromAddress = getAddress(webhookEvent.event.activity[0].fromAddress)
    const value = webhookEvent.event.activity[0].value
    const asset = webhookEvent.event.activity[0].asset
    const txHash = webhookEvent.event.activity[0].hash
    const tokenAddress = getAddress(webhookEvent.event.activity[0]?.log?.address || '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')

    const backendWallet = await this.backendWalletEthereumService.findWalletByAddress(toAddress)

    if (!isEmpty(backendWallet)) {
      const paymentLink = await this.paymentLinkModel.findOne({ backendWalletId: backendWallet._id, status: status.NOT_PAID })

      if (!isEmpty(paymentLink)) {
        paymentLink.receivedAmount = value
        paymentLink.receivedTokenAddress = tokenAddress
        paymentLink.receivedTokenSymbol = asset
        paymentLink.fromAddress = fromAddress
        paymentLink.webhookEvent = webhookEvent
        paymentLink.txHash = txHash

        const amountFloat = paymentLink.amount
        const receivedAmountFloat = parseFloat(paymentLink.receivedAmount)

        if (!this.isTokenMatch(paymentLink, tokenAddress, asset)) {
          paymentLink.status = status.WRONG_TOKEN
        } else if (receivedAmountFloat === amountFloat) {
          paymentLink.status = status.SUCCESSFUL
        } else if (receivedAmountFloat > amountFloat) {
          paymentLink.status = status.OVERPAID
        } else {
          paymentLink.status = status.UNDERPAID
        }

        await paymentLink.save()
        if (paymentLink.webhookUrl) {
          const paymentLinkWebhookEvent = [
            {
              status: paymentLink.status.toLowerCase(),
              from: fromAddress,
              to: toAddress,
              txHash,
              amount: value
            }
          ]
          this.webhookSendService.sendData(paymentLinkWebhookEvent, paymentLink.webhookUrl)
        }
      }
    }
  }

  isTokenMatch (paymentLink: EthereumPaymentLink, tokenAddress: string, asset: string) {
    return paymentLink.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() &&
        paymentLink.tokenSymbol.toLowerCase() === asset.toLowerCase()
  }
}
