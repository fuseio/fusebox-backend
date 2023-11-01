import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { catchError, lastValueFrom, map } from 'rxjs'
import { isEmpty, keyBy, merge, values } from 'lodash'
import { ConfigService } from '@nestjs/config'
import { backendWalletModelString } from '@app/apps-service/charge-api/backend-wallet.constants'
import { Model } from 'mongoose'
import { BackendWallet } from '@app/apps-service/charge-api/interfaces/backend-wallet.interface'
import { walletTypes } from '@app/apps-service/charge-api/schemas/backend-wallet.schema'
import { TransferTokensDto } from '@app/apps-service/payments/dto/transfer-tokens.dto'
import { formatUnits } from 'nestjs-ethers'

@Injectable()
export class ChargeApiService {
  private readonly logger = new Logger(ChargeApiService.name)

  constructor (
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(backendWalletModelString)
    private backendWalletModel: Model<BackendWallet>
  ) { }

  get getPaymentsAllowedTokens () {
    return this.configService.get('paymentsAllowedTokens')
  }

  get chargeBaseUrl () {
    return this.configService.getOrThrow('CHARGE_BASE_URL')
  }

  get unmarshalBaseUrl () {
    return this.configService.get('UNMARSHAL_BASE_URL')
  }

  get unmarshalAuthKey () {
    return this.configService.get('UNMARSHAL_AUTH_KEY')
  }

  get chargePublicKey () {
    return this.configService.getOrThrow('CHARGE_PUBLIC_KEY')
  }

  get chargeWebhookId () {
    return this.configService.get('CHARGE_WEBHOOK_ID')
  }

  get walletPhoneNumber () {
    return this.configService.get('CHARGE_WALLET_PHONE_NUMBER')
  }

  get getSleepMS () {
    return this.configService.get('JOB_SLEEP_MS')
  }

  sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async createBackendWallet (walletType: walletTypes): Promise<Record<string, any>> {
    const phoneNumber = this.walletPhoneNumber
    const url = `${this.chargeBaseUrl}/api/v0/admin/wallets/create?apiKey=${this.chargePublicKey}`

    const requestBody = {
      phoneNumber
    }

    const responseData = await this.httpProxyPost(url, requestBody)

    const jobData = responseData?.job
    const walletAddress = jobData?.data?.walletAddress

    const backendWallet = await this.backendWalletModel.create({
      jobId: jobData._id,
      walletAddress,
      walletType
    })

    setTimeout(async () => {
      const updatedJobData = await this.getUpdatedJobData(jobData)
      await this.backendWalletModel.findByIdAndUpdate(
        backendWallet._id,
        {
          walletAddress: updatedJobData.data.walletAddress,
          accountAddress: updatedJobData.data.accountAddress,
          ownerAddress: updatedJobData.data.data.owner
        }
      )
    }, this.getSleepMS)

    backendWallet.save()

    return backendWallet
  }

  async transferTokens (transferTokensDto: TransferTokensDto) {
    const url = `${this.chargeBaseUrl}/api/v0/admin/tokens/transfer?apiKey=${this.chargePublicKey}`

    const requestBody = {
      from: transferTokensDto.from,
      to: transferTokensDto.to,
      amount: transferTokensDto.amount,
      tokenAddress: transferTokensDto.tokenAddress
    }

    const responseData = await this.httpProxyPost(url, requestBody)

    let jobData = responseData?.job

    await this.sleep(this.getSleepMS)

    jobData = await this.getUpdatedJobData(jobData)

    this.logger.log(JSON.stringify(jobData))

    if (jobData?.data?.status === 'failed') {
      throw new HttpException(
        `Transfering tokens failed. Fail reason ${jobData?.data?.failReason}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }

    return jobData
  }

  async getWalletBalance (address: string, networkName: string = 'fuse') {
    const tokensBalanceUrl = `${this.unmarshalBaseUrl}/v1/${networkName}/address/${address}/assets?chainId=122&token=false&auth_key=${this.unmarshalAuthKey}`

    const tokensBalance = await this.httpProxyGet(tokensBalanceUrl)

    const paymentsAllowedTokens = this.getPaymentsAllowedTokens

    const extendedTokensBalance = values(merge(keyBy(tokensBalance, 'contract_address'), keyBy(paymentsAllowedTokens, 'contract_address')))

    for (const [index, token] of extendedTokensBalance.entries()) {
      if (isEmpty(token.balance)) {
        token.balance = '0'
      }

      if (isEmpty(token.verified)) {
        const priceData = await this.getPriceFromTradeApi(token.tokenAddress || token.contract_address)
        token.quote_rate = priceData.data.price
        const formattedBalance = formatUnits(token.balance, token.contract_decimals)
        token.quote = (parseFloat(formattedBalance) * parseFloat(token.quote_rate)).toString()

        extendedTokensBalance[index] = token
      }
    }

    return extendedTokensBalance
  }

  async getBackendWalletByAddress (address: string) {
    return this.backendWalletModel.findOne({ walletAddress: address })
  }

  async getUpdatedJobData (jobData: any) {
    const jobId = jobData?._id

    const url = `${this.chargeBaseUrl}/api/v0/jobs/${jobId}?apiKey=${this.chargePublicKey}`

    const responseData = await this.httpProxyGet(url)

    return responseData
  }

  async addWebhookAddress (params: { walletAddress: string, webhookId: string }) {
    console.log('Adding address to the webhook...')
    const url = `${this.chargeBaseUrl}/api/v0/notifications/webhook/add-addresses?apiKey=${this.chargePublicKey}`
    const requestBody = {
      webhookId: params.webhookId,
      addresses: [params.walletAddress]
    }

    await this.httpProxyPost(url, requestBody)
  }

  async getPriceFromTradeApi (tokenAddress: string) {
    const url = `${this.chargeBaseUrl}/api/v0/trade/price/${tokenAddress}?apiKey=${this.chargePublicKey}`
    const response = await this.httpProxyGet(url)
    return response
  }

  async httpProxyPost (url: string, requestBody: any) {
    const responseData = await lastValueFrom(
      this.httpService.post(url, requestBody)
        .pipe(map((response) => {
          return response.data
        })
        )
        .pipe(
          catchError(e => {
            throw new HttpException(
              `${e?.response?.statusText}: ${e?.response?.data?.error}`,
              e?.response?.status
            )
          })
        )
    )

    return responseData
  }

  async httpProxyGet (url: string) {
    const responseData = await lastValueFrom(
      this.httpService.get(url)
        .pipe(map((response) => {
          return response.data
        })
        )
        .pipe(
          catchError(e => {
            throw new HttpException(
              `${e?.response?.statusText}: ${e?.response?.data?.error}`,
              e?.response?.status
            )
          })
        )
    )

    return responseData
  }
}
