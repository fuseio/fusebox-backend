import { walletTypes } from '@app/apps-service/charge-api/schemas/backend-wallet.schema'
import { ethereumBackendWalletModelString } from '@app/apps-service/ethereum-payments/ethereum-backend-wallet.constants'
import { EthereumBackendWallet } from '@app/apps-service/ethereum-payments/interfaces/ethereum-backend-wallet.interface'
import { TransferTokensDto } from '@app/apps-service/payments/dto/transfer-tokens.dto'
import { HDNode } from '@ethersproject/hdnode'
import { HttpService } from '@nestjs/axios'
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Model } from 'mongoose'
import { catchError, lastValueFrom, map } from 'rxjs'

@Injectable()
export class BackendWalletsEthereumService {
  private readonly logger = new Logger(BackendWalletsEthereumService.name)

  constructor (
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(ethereumBackendWalletModelString)
    private backendWalletEthereumModel: Model<EthereumBackendWallet>
  ) { }

  get getPaymentsAllowedTokens () {
    return this.configService.get('paymentsAllowedTokens')
  }

  get unmarshalBaseUrl () {
    return this.configService.get('UNMARSHAL_BASE_URL')
  }

  get unmarshalAuthKey () {
    return this.configService.get('UNMARSHAL_AUTH_KEY')
  }

  get alchemyBaseUrl () {
    return this.configService.get('ALCHEMY_BASE_URL')
  }

  get alchemyAuthKey () {
    return this.configService.get('ALCHEMY_AUTH_KEY')
  }

  get alchemyWebookId () {
    return this.configService.get('ALCHEMY_WEBHOOK_ID')
  }

  get getMnemonic () {
    return this.configService.get('CHARGE_PAYMENTS_ETHEREUM_MNEMONIC')
  }

  get getSleepMS () {
    return this.configService.get('JOB_SLEEP_MS')
  }

  sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async createBackendWallet (walletType: walletTypes): Promise<Record<string, any>> {
    const hdNode = HDNode.fromMnemonic(this.getMnemonic)

    const lastWallet = await this.backendWalletEthereumModel.findOne().sort({childIndex: -1})
    const newIndex = (lastWallet?.childIndex || 0) + 1
    const childNode = hdNode.derivePath("m/44'/60'/0'/0/" + newIndex)
    const childWalletAddress = childNode.address.toString()

    const backendWallet = await this.backendWalletEthereumModel.create({
      childIndex: newIndex,
      walletAddress: childWalletAddress,
      walletType
    })

    backendWallet.save()

    return backendWallet
  }

  async transferTokens (transferTokensDto: TransferTokensDto) {
    
  }

  async getWalletBalance (address: string) {
    
  }

  async getBackendWalletByAddress (address: string) {
    return this.backendWalletEthereumModel.findOne({ walletAddress: address })
  }

  async addWebhookAddress (address: string) {
    const url = `${this.alchemyBaseUrl}`

    const requestBody = {
      webhook_id: this.alchemyWebookId,
      addresses_to_add: [address],
      addresses_to_remove: []
    }

    await this.httpProxyPatch(url, requestBody)
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

  async httpProxyPatch (url: string, requestBody: any) {
    const responseData = await lastValueFrom(
      this.httpService.patch(url, requestBody)
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
