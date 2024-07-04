import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { applicationModelString } from '@app/accounts-service/app-store/constants/app-store.constants'
import { Model } from 'mongoose'
import { ActivatedApp, Application, AvailableApp } from '@app/accounts-service/app-store/interfaces/application.interface'
import { UsersService } from '@app/accounts-service/users/users.service'
import { ConfigService } from '@nestjs/config'
import { merge, keyBy, values } from 'lodash'
import { appStoreService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { ApiKeysDto } from '@app/apps-service/api-keys/dto/api-keys.dto'
import { CreatePaymentLinkDto } from '@app/apps-service/payments/dto/create-payment-link.dto'
import { TransferTokensDto } from '@app/apps-service/payments/dto/transfer-tokens.dto'

@Injectable()
export class AppStoreService {
  constructor (
    @Inject(appStoreService) private readonly appStoreClient: ClientProxy,
    @Inject(applicationModelString)
    private applicationModel: Model<Application>,
    private usersService: UsersService,
    private configService: ConfigService
  ) { }

  get availableApps () {
    return this.configService.get('availableApps') as AvailableApp[]
  }

  isAppAvailable (appName): Boolean {
    return this.availableApps.some(app => app.appName === appName)
  }

  async activateApp (appName: string, auth0Id: string): Promise<any> {
    if (!this.isAppAvailable(appName)) {
      return new HttpException('Application not found', HttpStatus.NOT_FOUND)
    }

    const ownerId = await this.getUserId(auth0Id)

    try {
      await callMSFunction(this.appStoreClient, 'create_public', { ownerId, appName } as ApiKeysDto)
      await callMSFunction(this.appStoreClient, 'create_payment_account', ownerId)
    } catch (err) {
      return err
    }

    return this.applicationModel.updateOne({ ownerId, appName }, { isActivated: true }, { upsert: true })
  }

  async getActivatedApps (auth0Id: string): Promise<ActivatedApp[]> {
    const ownerId = await this.getUserId(auth0Id)
    const appDocs = await this.applicationModel.find({ ownerId, isActivated: true })
    const apps = appDocs.map(app => app.toObject() as Application)
    let extendedApps = values(merge(keyBy(apps, 'appName'), keyBy(this.availableApps, 'appName')))
    extendedApps = extendedApps.filter(app => app?.isActivated === true)

    return extendedApps
  }

  async getUserId (auth0Id: string) {
    const user = await this.usersService.findOneByAuth0Id(auth0Id)
    return user?.id
  }

  async getApiKeysInfo (appName, auth0Id) {
    const ownerId = await this.getUserId(auth0Id)

    return callMSFunction(this.appStoreClient, 'get_api_keys_info', { ownerId, appName } as ApiKeysDto)
  }

  async createSecret (appName, auth0Id) {
    const ownerId = await this.getUserId(auth0Id)

    return callMSFunction(this.appStoreClient, 'create_secret', { ownerId, appName } as ApiKeysDto)
  }

  async updateSecret (appName, auth0Id) {
    const ownerId = await this.getUserId(auth0Id)

    return callMSFunction(this.appStoreClient, 'update_secret', { ownerId, appName } as ApiKeysDto)
  }

  async createPaymentLink (auth0Id: string, createPaymentLinkDto: CreatePaymentLinkDto) {
    const ownerId = await this.getUserId(auth0Id)

    createPaymentLinkDto.ownerId = ownerId

    return callMSFunction(this.appStoreClient, 'create_payment_link', createPaymentLinkDto)
  }

  async getPaymentLink (paymentLinkId: string) {
    return callMSFunction(this.appStoreClient, 'get_payment_link', paymentLinkId)
  }

  async getPaymentLinks (auth0Id: string) {
    const ownerId = await this.getUserId(auth0Id)

    return callMSFunction(this.appStoreClient, 'get_payment_links', ownerId)
  }

  async getPaymentsAllowedTokens () {
    return callMSFunction(this.appStoreClient, 'get_allowed_tokens', '')
  }

  async getWalletBalance (auth0Id: string) {
    const ownerId = await this.getUserId(auth0Id)

    return callMSFunction(this.appStoreClient, 'get_wallet_balance', ownerId)
  }

  async transferTokensFromPaymentsAccount (auth0Id: string, transferTokensDto: TransferTokensDto) {
    const ownerId = await this.getUserId(auth0Id)
    transferTokensDto.ownerId = ownerId

    return callMSFunction(this.appStoreClient, 'transfer_tokens', transferTokensDto)
  }
}
