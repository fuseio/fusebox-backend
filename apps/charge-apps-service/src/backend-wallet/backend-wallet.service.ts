import { HttpService } from '@nestjs/axios'
import { HttpException, Inject, Injectable } from '@nestjs/common'
import { catchError, lastValueFrom, map } from 'rxjs'
import { isEmpty } from 'lodash'
import { ConfigService } from '@nestjs/config'
import { backendWalletModelString } from '@app/apps-service/backend-wallet/backend-wallet.constants'
import { Model } from 'mongoose'
import { BackendWallet } from '@app/apps-service/backend-wallet/interfaces/backend-wallet.interface'
import { walletTypes } from '@app/apps-service/backend-wallet/schemas/backend-wallet.schema'

@Injectable()
export class BackendWalletService {
  constructor (
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(backendWalletModelString)
    private backendWalletModel: Model<BackendWallet>
    ) { }

  get chargeBaseUrl() {
    return this.configService.get('CHARGE_BASE_URL')
  }

  get chargePublicKey() {
    return this.configService.get('CHARGE_PUBLIC_KEY')
  }

  get walletPhoneNumber() {
    return this.configService.get('CHARGE_WALLET_PHONE_NUMBER')
  }

  get getSleepMS() {
    return this.configService.get('JOB_SLEEP_MS')
  }

  sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  
  async createBackendWallet (walletType: walletTypes): Promise<Record<string, any>> {
    
    const phoneNumber = this.walletPhoneNumber
    const url = `${this.chargeBaseUrl}/api/v0/admin/wallets/create?apiKey=${this.chargePublicKey}`

    const requestBody = {
      phoneNumber
    }

    const responseData = await this.httpProxyPost(url, requestBody)

    let jobData = responseData?.job

    await this.sleep(this.getSleepMS)

    jobData = await this.getUpdatedJobData(jobData)

    const backendWallet = await this.backendWalletModel.create({
      jobId: jobData.data._id,
      walletAddress: jobData.data.data.walletAddress,
      accountAddress: jobData.data.accountAddress,
      ownerAddress: jobData.data.data.owner,
      walletType
    })

    backendWallet.save()

    return backendWallet
  }

  async getUpdatedJobData(jobData: any) {
    const jobId = jobData?._id

    const url = `${this.chargeBaseUrl}/api/v0/jobs/${jobId}?apiKey=${this.chargePublicKey}`

    const responseData = await this.httpProxyGet(url)

    return responseData
  }

  async httpProxyPost(url: string, requestBody: any) {
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

  async httpProxyGet(url: string) {
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
