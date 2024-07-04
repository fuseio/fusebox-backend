import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { AppStoreService } from '@app/accounts-service/app-store/app-store.service'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { User } from '@app/accounts-service/users/user.decorator'
import { CreatePaymentLinkDto } from '@app/apps-service/payments/dto/create-payment-link.dto'
import { TransferTokensDto } from '@app/apps-service/payments/dto/transfer-tokens.dto'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('App Store')
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

  @UseGuards(JwtAuthGuard)
  @Get('payments/allowed_tokens')
  getPaymentsAllowedTokens () {
    return this.appStoreService.getPaymentsAllowedTokens()
  }

  /***
    * Creates a payment link for the account
    */
  @UseGuards(JwtAuthGuard)
  @Post('payment_link')
  createPaymentLink (@Body() createPaymentLinkDto: CreatePaymentLinkDto, @User('sub') auth0Id: string) {
    return this.appStoreService.createPaymentLink(auth0Id, createPaymentLinkDto)
  }

  /***
    * Get a payment link for the account
    */
  @UseGuards(JwtAuthGuard)
  @Get('payment_link/:paymentLinkId')
  getPaymentLink (@Param('paymentLinkId') paymentLinkId: string) {
    return this.appStoreService.getPaymentLink(paymentLinkId)
  }

  /***
    * Gets all payment links for the account
    */
  @UseGuards(JwtAuthGuard)
  @Get('payment_links')
  getPaymentLinks (@User('sub') auth0Id: string) {
    return this.appStoreService.getPaymentLinks(auth0Id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('payments/account/balance')
  getWalletBalance (@User('sub') auth0Id: string) {
    return this.appStoreService.getWalletBalance(auth0Id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('payments/account/transfer_tokens')
  transferTokensFromPaymentsAccount (@User('sub') auth0Id: string, @Body() transferTokensDto: TransferTokensDto) {
    return this.appStoreService.transferTokensFromPaymentsAccount(auth0Id, transferTokensDto)
  }
}
