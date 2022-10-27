import { Inject, Injectable, Logger } from '@nestjs/common'
import { CreatePaymentLinkDto } from '@app/apps-service/payments/dto/create-payment-link.dto';
import { ChargeApiService } from '@app/apps-service/charge-api/charge-api.service';
import { paymentAccountModelString, paymentLinkModelString } from '@app/apps-service/payments/payments.constants';
import { Model } from 'mongoose';
import { PaymentAccount } from '@app/apps-service/payments/interfaces/payment-account.interface';
import { PaymentLink } from '@app/apps-service/payments/interfaces/payment-link.interface';
import { walletTypes } from '@app/apps-service/charge-api/schemas/backend-wallet.schema';
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface';
import { status } from '@app/apps-service/payments/schemas/payment-link.schema';
import { ConfigService } from '@nestjs/config';
import { BackendWallet } from '@app/apps-service/charge-api/interfaces/backend-wallet.interface';
import { isEmpty } from 'lodash';
import { TransferTokensDto } from '@app/apps-service/payments/dto/transfer-tokens.dto';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name)
    
    constructor(
        private chargeApiService: ChargeApiService,
        @Inject(paymentAccountModelString)
        private paymentAccountModel: Model<PaymentAccount>,
        @Inject(paymentLinkModelString)
        private paymentLinkModel: Model<PaymentLink>,
        private readonly configService: ConfigService
    ) { }

    async getPaymentsAllowedTokens() {
        return this.configService.get('paymentsAllowedTokens')
    }

    async createPaymentAccount(ownerId: string) {
        const backendWallet = await this.chargeApiService.createBackendWallet(walletTypes.PAYMENT_ACCOUNT)

        const paymentAccount = await this.paymentAccountModel.create({
            ownerId, backendWalletId: backendWallet._id
        })

        paymentAccount.save()

        return paymentAccount
    }

    async createPaymentLink(userId: string, createPaymentLinkDto: CreatePaymentLinkDto) {
        if (isEmpty(createPaymentLinkDto.ownerId)) {
            createPaymentLinkDto.ownerId = userId
        }

        const backendWallet = await this.chargeApiService.createBackendWallet(walletTypes.PAYMENT_LINK)

        createPaymentLinkDto.backendWalletId = backendWallet._id

        const paymentLink = await this.paymentLinkModel.create(createPaymentLinkDto)

        paymentLink.save()

        await this.chargeApiService.addWebhookAddress(backendWallet.walletAddress)

        return paymentLink
    }

    async getPaymentLink(paymentLinkId: string) {
        return this.paymentLinkModel.findById(paymentLinkId).populate('backendWalletId', 'walletAddress')
    }

    async getPaymentLinks(ownerId: string) {
        return this.paymentLinkModel.find({ownerId})
    }

    async getWalletBalance(ownerId: string) {
        const paymentAccount = await this.paymentAccountModel.findOne({ownerId: ownerId}).
            populate<{ backendWalletId: BackendWallet }>('backendWalletId')
        
        return this.chargeApiService.getWalletBalance(paymentAccount.backendWalletId.walletAddress)
    }

    async transferTokens(transferTokensDto: TransferTokensDto) {
        if (isEmpty(transferTokensDto.from)) {
            const paymentAccount = await this.paymentAccountModel.
            findOne({ownerId: transferTokensDto.ownerId}).
            populate<{ backendWalletId: BackendWallet }>('backendWalletId')

            transferTokensDto.from = paymentAccount.backendWalletId.walletAddress
        }
        
        return this.chargeApiService.transferTokens(transferTokensDto)
    }

    async handleWebhook(webhookEvent: WebhookEvent) {
        if (webhookEvent.direction === 'incoming') {
            const backendWallet = await this.chargeApiService.getBackendWalletByAddress(webhookEvent.to)
            const paymentLink = await this.paymentLinkModel.findOne({backendWalletId: backendWallet._id})

            paymentLink.receivedAmount = webhookEvent.valueEth
            paymentLink.receivedTokenAddress = webhookEvent.tokenAddress
            paymentLink.receivedTokenSymbol = webhookEvent.tokenSymbol

            const amountFloat = paymentLink.amount
            const receivedAmountFloat = parseFloat(paymentLink.receivedAmount)
            
            if (!this.isTokenMatch(paymentLink, webhookEvent)) {
                paymentLink.status = status.TOKEN_MISMATCH
            } else if (receivedAmountFloat === amountFloat) {
                paymentLink.status = status.SUCCESSFUL
            } else if (receivedAmountFloat > amountFloat) {
                paymentLink.status = status.OVERPAID
            } else {
                paymentLink.status = status.UNDERPAID
            }

            try {
                await paymentLink.save()
            } catch (error) {
                this.logger.error(`Failed to save payment link: ${error}`)
            }

            const ownerId = paymentLink.ownerId
            const paymentAccount = await this.paymentAccountModel.findOne({ownerId: ownerId}).
            populate<{ backendWalletId: BackendWallet }>('backendWalletId')

            try {
                await this.transferTokens({
                    tokenAddress: paymentLink.receivedTokenAddress,
                    from: backendWallet.walletAddress,
                    to: paymentAccount.backendWalletId.walletAddress,
                    amount: paymentLink.receivedAmount
                } as TransferTokensDto)
            } catch (error) {
                this.logger.error(`Failed to send funds to main account: ${error}`)
            }
        }
        
    }

    isTokenMatch(paymentLink: PaymentLink, webhookEvent: WebhookEvent) {
        return paymentLink.tokenAddress === webhookEvent.tokenAddress && 
        paymentLink.tokenSymbol === webhookEvent.tokenSymbol
    }
}
