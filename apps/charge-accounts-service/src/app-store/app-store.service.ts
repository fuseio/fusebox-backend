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

  async activateApp (appName: String, auth0Id: string): Promise<any> {
    if (!this.isAppAvailable(appName)) {
      return new HttpException('Application not found', HttpStatus.NOT_FOUND)
    }

    const ownerId = await this.getUserId(auth0Id)

    try {
      await callMSFunction(this.appStoreClient, 'create_public', { ownerId, appName } as ApiKeysDto)
    } catch (err) {
      return err
    }

    return this.applicationModel.updateOne({ ownerId, appName }, { isActivated: true }, { upsert: true })
  }

  async getActivatedApps (auth0Id: string): Promise<ActivatedApp[]> {
    const ownerId = await this.getUserId(auth0Id)
    const appDocs = await this.applicationModel.find({ ownerId, isActivated: true })
    const apps = appDocs.map(app => app.toObject() as Application)
    const extendedApps = merge(keyBy(apps, 'appName'), keyBy(this.availableApps, 'appName'))

    return values(extendedApps)
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
}
