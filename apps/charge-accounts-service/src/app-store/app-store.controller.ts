import { Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { AppStoreService } from '@app/accounts-service/app-store/app-store.service'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { User } from '@app/accounts-service/users/user.decorator'

@Controller('app-store')
export class AppStoreController {
  constructor (private readonly appStoreService: AppStoreService) { }

    /***
     * Activate an app by appName, if app has API then it also creates a public key for access
     * @param appName
     */
    @UseGuards(JwtAuthGuard)
    @Post('activate/:appName')
  activateApp (@Param('appName') appName: string, @User('sub') auth0Id: string) {
    return this.appStoreService.activateApp(appName, auth0Id)
  }

    /***
     * Returns list of apps that are activated in the authenticated account
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    getActivatedApps (@User('sub') auth0Id: string) {
      return this.appStoreService.getActivatedApps(auth0Id)
    }

    /***
     * Returns metadata about the activated app in the account
     */
    @UseGuards(JwtAuthGuard)
    @Get('api-keys/:appName')
    getAppInfo (@Param('appName') appName: string, @User('sub') auth0Id: string) {
      return this.appStoreService.getApiKeysInfo(appName, auth0Id)
    }

    /***
      * Creates an API secret key for `appName` of the account
      */
    @UseGuards(JwtAuthGuard)
    @Post('secret/:appName')
    createSecret (@Param('appName') appName: string, @User('sub') auth0Id: string) {
      return this.appStoreService.createSecret(appName, auth0Id)
    }

    /***
      * Rolls the API secret key for `appName` of the account
      */
    @UseGuards(JwtAuthGuard)
    @Put('secret/:appName')
    updateSecret (@Param('appName') appName: string, @User('sub') auth0Id: string) {
      return this.appStoreService.updateSecret(appName, auth0Id)
    }
}
