import { walletTypes } from '@app/apps-service/charge-api/schemas/backend-wallet.schema'
import { CreateEthereumPaymentLinkDto } from '@app/apps-service/ethereum-payments/dto/create-ethereum-payment-link.dto'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { isEmpty, parseInt } from 'lodash'
import { HttpService } from '@nestjs/axios'
import { BackendWalletsEthereumService } from '@app/apps-service/ethereum-payments/backend-wallets-ethereum.service'
import { EthereumFundingAccount } from '@app/apps-service/ethereum-payments/interfaces/ethereum-funding-account.interface'
import { EthereumPaymentLink } from '@app/apps-service/ethereum-payments/interfaces/ethereum-payment-link.interface'
import { ethereumFundingAccountModelString, ethereumPaymentLinkModelString } from '@app/apps-service/ethereum-payments/ethereum-payments.constants'
import { status } from '@app/apps-service/ethereum-payments/schemas/ethereum-payment-link.schema'
import { EthereumBackendWallet } from '@app/apps-service/ethereum-payments/interfaces/ethereum-backend-wallet.interface'
import { Model, Types, ObjectId } from 'mongoose'
import { getAddress, parseUnits, EtherscanProvider, Wallet, formatEther, BigNumber, hexlify, formatUnits, getDefaultProvider, parseEther } from 'nestjs-ethers'
import { HDNode } from '@ethersproject/hdnode'
import { AxiosResponse } from 'axios'
import { lastValueFrom, Observable } from 'rxjs'


@Injectable()
export class EthereumPaymentsService {
  private readonly logger = new Logger(EthereumPaymentsService.name)

  constructor(
    private backendWalletEthereumService: BackendWalletsEthereumService,
    @Inject(ethereumFundingAccountModelString)
    private fundingAccountModel: Model<EthereumFundingAccount>,
    @Inject(ethereumPaymentLinkModelString)
    private paymentLinkModel: Model<EthereumPaymentLink>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) { }

  get networkName() {
    return this.configService.get('ETHEREUM_PAYMENTS_NETWORK_NAME')
  }
  get mnemonic() {
    return this.configService.get('CHARGE_PAYMENTS_ETHEREUM_MNEMONIC')
  }

  get allowedPaymentTokens() {
    return this.configService.get(`${this.networkName}PaymentsAllowedTokens`)
  }

  get allowedTokenAddresses() {
    return this.allowedPaymentTokens.map(token => token.tokenAddress)
  }

  get allowedTokenSymbols() {
    return this.allowedPaymentTokens.map(token => token.tokenSymbol)
  }

  async getPaymentsAllowedTokens() {
    return this.allowedPaymentTokens
  }

  async getEthPriceInUsd(): Promise<any> {
    const ethInUsd = this.httpService.get(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`)
    return (await lastValueFrom(ethInUsd)).data.ethereum.usd
  }

  isRequestedAllowedToken(createPaymentLinkEthereumDto: CreateEthereumPaymentLinkDto) {
    const isTokenAddressAllowed = this.allowedTokenAddresses.some(address => {
      return address.toLowerCase() === createPaymentLinkEthereumDto.tokenAddress.toLowerCase()
    })

    const isTokenSymbolAllowed = this.allowedTokenSymbols.some(symbol => {
      return symbol.toLowerCase() === createPaymentLinkEthereumDto.tokenSymbol.toLowerCase()
    })

    return isTokenAddressAllowed && isTokenSymbolAllowed
  }

  async createFundingAccount(ownerId: string) {
    const backendWallet = await this.backendWalletEthereumService.createBackendWallet(walletTypes.FUNDING_ACCOUNT)
    const fundingAccount = await this.fundingAccountModel.create({
      ownerId, backendWalletId: backendWallet._id
    })
    fundingAccount.save()

    return fundingAccount
  }

  async createPaymentLink(userId: string, createPaymentLinkEthereumDto: CreateEthereumPaymentLinkDto) {
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

  async getPaymentLink(paymentLinkId: string) {
    const paymentLink = await this.paymentLinkModel.findById(paymentLinkId).populate('backendWalletId', 'walletAddress')

    if (isEmpty(paymentLink)) {
      throw new HttpException(`Payment link with id: ${paymentLinkId} was not found`,
        HttpStatus.NOT_FOUND)
    }
    return paymentLink
  }

  async getPaymentLinks(ownerId: string) {
    return this.paymentLinkModel.find({ ownerId })
  }

  async existCheckAndCreateFundingAccount(userId: string, ownerId: string) {
    const fundingAccount = await this.fundingAccountModel.findOne({ ownerId }).populate<{ backendWalletId: EthereumBackendWallet }>('backendWalletId')
    if (isEmpty(fundingAccount)) {
      const newFundingAccount = await (await this.createFundingAccount(ownerId)).populate<{ backendWalletId: EthereumBackendWallet }>('backendWalletId')
      return newFundingAccount.backendWalletId.walletAddress
    } else {
      return `Funding account already exist ${fundingAccount.backendWalletId.walletAddress}`
    }
  }

  async sweepPaymentLinks(userId: string, ownerId: string, sweepingAddress: string) {
    let network = 'goerli' // use 'homestead' for ETH mainnet 
    var provider = getDefaultProvider(network);
    const gasLimitForErc20Txn = 100000
    const gasLimitForEthTxn = 21000
    console.log('gasPriceInWei')
    let gasPriceInWei = formatUnits((await provider.getFeeData()).gasPrice, 'wei')
    console.log('GetEstimatedEthFeeForOneErc20Txn', gasLimitForErc20Txn * <any>gasPriceInWei)
    const estimatedEthFeeForOneErc20Txn = parseFloat(formatUnits(BigNumber.from(gasLimitForErc20Txn * <any>gasPriceInWei), 'ether'));
    console.log('GetEstimatedEthFeeForOneEthTxn')
    const estimatedEthFeeForOneEthTxn = parseFloat(formatEther(gasLimitForEthTxn * parseFloat(gasPriceInWei)));
    const eth_price = await this.getEthPriceInUsd()
    const estimatedFeeForSweepOneWalletInUsd = (estimatedEthFeeForOneErc20Txn + estimatedEthFeeForOneEthTxn) * eth_price
    const fulfilledPaymentLinks = await this.paymentLinkModel.find({ ownerId, status: { $ne: 'Not Paid' } }).populate<{ backendWalletId: EthereumBackendWallet }>('backendWalletId')
    const profitablePaymentLinks = fulfilledPaymentLinks.filter(p => p.amount > estimatedFeeForSweepOneWalletInUsd)
    const nonProfitablePaymentLinks = fulfilledPaymentLinks.filter(p => p.amount < estimatedFeeForSweepOneWalletInUsd)
    const ethFeeForAllLinks = (estimatedEthFeeForOneErc20Txn + estimatedEthFeeForOneEthTxn) * nonProfitablePaymentLinks.length
    const fundingAccount = await this.fundingAccountModel.findOne({ ownerId }).populate<{ backendWalletId: EthereumBackendWallet }>('backendWalletId')

    if (isEmpty(fundingAccount)) {
      throw new HttpException(`Funding account was not found`,
        HttpStatus.NOT_FOUND)
    }
    const fundingAccountBalance = formatEther(await provider.getBalance(fundingAccount.backendWalletId.walletAddress))

    if (ethFeeForAllLinks > parseFloat(fundingAccountBalance)) {
      return `You have: ${nonProfitablePaymentLinks.length} successful payments, but your funding account should contain ${ethFeeForAllLinks} eth in order to proceed sweep but has only 
      ${fundingAccountBalance} so please send approx ${ethFeeForAllLinks - parseFloat(fundingAccountBalance)} ether to ${fundingAccount.backendWalletId.walletAddress}`
    }
    console.log('start sweeping....')

    ///should build schema to response
    async function ethSendToHdChild(mnemonic, fundingAccountChildIndex) {
      const HDnode = HDNode.fromMnemonic(mnemonic)
      const fundingWallet = HDnode.derivePath("m/44'/60'/0'/0/" + fundingAccountChildIndex)
      console.log('fundingWallet', fundingWallet.address)
      let transactions = []
      console.log(estimatedEthFeeForOneErc20Txn);
      let wallet = new Wallet(fundingWallet.privateKey, provider)
      // console.log(BigNumber.from(estimatedEthFeeForOneErc20Txn))
      for (let i = 0; i < nonProfitablePaymentLinks.length; i++) {
        let thisWallet = HDnode.derivePath("m/44'/60'/0'/0/" + nonProfitablePaymentLinks[i].backendWalletId.childIndex)
        let nonce = await provider.getTransactionCount(wallet.address)
        transactions.push(sentTx(nonce, wallet, thisWallet.address))
        console.log('account id:', i, thisWallet.address)
      }


      await Promise.all(transactions).then(res => {
        console.log("Log" + res)
      })
    }


    async function sentTx(nonce, wallet, to) {
      const transaction = {
        nonce: nonce,
        gasLimit: hexlify(BigNumber.from(gasLimitForEthTxn)),
        gasPrice: hexlify(BigNumber.from(gasPriceInWei)),
        to: hexlify(to),
        value: hexlify(BigNumber.from(parseEther(estimatedEthFeeForOneErc20Txn.toString()))), // total amount to send
      };
      return wallet.sendTransaction(transaction)
    }

    await ethSendToHdChild(this.mnemonic, fundingAccount.backendWalletId.childIndex)


    return nonProfitablePaymentLinks
  }

  async handleWebhook(webhookEvent: any) {
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
      }
    }
  }

  isTokenMatch(paymentLink: EthereumPaymentLink, tokenAddress: string, asset: string) {
    return paymentLink.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() &&
      paymentLink.tokenSymbol.toLowerCase() === asset.toLowerCase()
  }
}
