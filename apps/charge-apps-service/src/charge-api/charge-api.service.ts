import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { catchError, lastValueFrom, map } from 'rxjs'
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
    return this.configService.get('CHARGE_BASE_URL')
  }

  get unmarshalBaseUrl () {
    return this.configService.get('UNMARSHAL_BASE_URL')
  }

  get unmarshalAuthKey () {
    return this.configService.get('UNMARSHAL_AUTH_KEY')
  }

  get chargePublicKey () {
    return this.configService.get('CHARGE_PUBLIC_KEY')
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

  async getWalletBalance (address: string) {
    try {
      const tokensBalanceUrl = `https://explorer.fuse.io/api/v2/addresses/${address}/token-balances`
      const nativeBalanceUrl = `https://explorer.fuse.io/api?module=account&action=eth_get_balance&address=${address}`

      const [tokensBalance, nativeBalanceResponse] = await Promise.all([
        this.httpProxyGet(tokensBalanceUrl),
        this.httpProxyGet(nativeBalanceUrl)
      ])

      const nativeBalanceHex = nativeBalanceResponse.result
      const nativeBalance = parseInt(nativeBalanceHex, 16).toString()

      // Process native token balance
      const extendedTokensBalance = [{
        tokenSymbol: 'FUSE',
        tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        contract_address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        contract_decimals: 18,
        logo_url: 'https://assets.unmarshal.io/tokens/fuse_0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png',
        value: nativeBalance,
        token: {
          address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          decimals: 18,
          exchange_rate: 0 // Placeholder, update with actual rate if available
        },
        quote: '0' // Placeholder, update with actual quote if available
      }]

      for (const token of tokensBalance) {
        const tokenData = {
          tokenSymbol: token.token.symbol,
          tokenAddress: token.token.address,
          contract_address: token.token.address,
          contract_decimals: token.token.decimals,
          logo_url: token.token.icon_url,
          value: token.value,
          token: {
            address: token.token.address,
            decimals: token.token.decimals,
            exchange_rate: 0
          },
          quote: '0'
        }

        if (parseFloat(token.value) > 0) {
          try {
            const priceData = await this.getPriceFromTradeApi(token.token.address)
            tokenData.token.exchange_rate = priceData.data.price || 0
          } catch (error) {
            tokenData.token.exchange_rate = 0
          }

          const formattedBalance = formatUnits(token.value, token.token.decimals)
          tokenData.quote = (parseFloat(formattedBalance) * tokenData.token.exchange_rate).toString() || '0'
        }

        extendedTokensBalance.push(tokenData)
      }

      return extendedTokensBalance
    } catch (error) {
      this.logger.error(`Failed to get wallet balance for address ${address}: ${error.message}`)
      throw new HttpException(
        `Failed to get wallet balance: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
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
