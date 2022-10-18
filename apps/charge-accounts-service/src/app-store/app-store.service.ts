import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { applicationModelString } from '@app/accounts-service/app-store/constants/app-store.constants'
import { Model } from 'mongoose';
import { ActivatedApp, Application, AvailableApp } from '@app/accounts-service/app-store/interfaces/application.interface';
import { UsersService } from '@app/accounts-service/users/users.service';
import { ConfigService } from '@nestjs/config';
import { merge, keyBy, values, unionBy } from 'lodash';

@Injectable()
export class AppStoreService {
    constructor (
        @Inject(applicationModelString)
        private applicationModel: Model<Application>,
        private usersService: UsersService,
        private configService: ConfigService
      ) { }

    get availableApps () {
        return this.configService.get('availableApps') as AvailableApp[]
    }

    isAppAvailable(appName): Boolean {
        return this.availableApps.some(app => app.appName === appName)
    }

    async activateApp(appName: String, auth0Id: string): Promise<any> {
        if (!this.isAppAvailable(appName)) {
            return new HttpException('Application not found', HttpStatus.NOT_FOUND)
        }

        const ownerId = await this.getUserId(auth0Id)
        return this.applicationModel.updateOne({ownerId, appName}, {isActivated: true}, {upsert: true})
    }

    async getActivatedApps(auth0Id: string): Promise<ActivatedApp[]> {
        const ownerId = await this.getUserId(auth0Id)
        let appDocs = await this.applicationModel.find({ownerId, isActivated: true})
        let apps = appDocs.map(app => app.toObject() as Application)
        let extendedApps = merge(keyBy(apps, 'appName'), keyBy(this.availableApps, 'appName'))
        
        return values(extendedApps)
        
    }

    async getUserId(auth0Id: string) {
        const user = await this.usersService.findOneByAuth0Id(auth0Id)
        return user?.id
    }
}
