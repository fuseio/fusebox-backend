import { Inject, Injectable } from '@nestjs/common'
import { CreatePaymentLinkDto } from '@app/apps-service/payments/dto/create-payment-link.dto';
import { BackendWalletService } from '@app/apps-service/backend-wallet/backend-wallet.service';
import { paymentAccountModelString, paymentLinkModelString } from '@app/apps-service/payments/payments.constants';
import { Model } from 'mongoose';
import { PaymentAccount } from '@app/apps-service/payments/interfaces/payment-account.interface';
import { PaymentLink } from '@app/apps-service/payments/interfaces/payment-link.interface';
import { walletTypes } from '@app/apps-service/backend-wallet/schemas/backend-wallet.schema';

@Injectable()
export class PaymentsService {
    constructor(
        private backendAccountService: BackendWalletService,
        @Inject(paymentAccountModelString)
        private paymentAccountModel: Model<PaymentAccount>,
        @Inject(paymentLinkModelString)
        private paymentLinkModel: Model<PaymentLink> 
    ) { }

    async createPaymentAccount(ownerId: string) {
        const backendWallet = await this.backendAccountService.createBackendWallet(walletTypes.PAYMENT_ACCOUNT)

        const paymentAccount = await this.paymentAccountModel.create({
            ownerId, backendWalletId: backendWallet._id
        })

        paymentAccount.save()

        return paymentAccount
    }

    async createPaymentLink(createPaymentLinkDto: CreatePaymentLinkDto) {
        const backendWallet = await this.backendAccountService.createBackendWallet(walletTypes.PAYMENT_LINK)

        createPaymentLinkDto.backendWalletId = backendWallet._id

        const paymentLink = await this.paymentLinkModel.create(createPaymentLinkDto)

        paymentLink.save()

        return paymentLink
    }

    async getPaymentLink(paymentLinkId: string) {
        return this.paymentLinkModel.findById(paymentLinkId).populate('backendWalletId', 'walletAddress')
    }

    async getPaymentLinks(ownerId: string) {
        return this.paymentLinkModel.find({ownerId})
    }
}
