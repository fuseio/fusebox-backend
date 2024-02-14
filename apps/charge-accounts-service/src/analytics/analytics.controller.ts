import { Controller, Post, Body } from '@nestjs/common'
import { AnalyticsService } from '@app/accounts-service/analytics/analytics.service'
import { MessagePattern } from '@nestjs/microservices'

@Controller('analytics')
export class AnalyticsController {
  constructor (private readonly analyticsService: AnalyticsService) { }

  @MessagePattern('handle-userOp-and-walletAction')
  async handleUserOpAndWalletAction (@Body() body: any) {
    return this.analyticsService.handleUserOpAndWalletAction(body)
  }

  @MessagePattern('handle-receive-walletAction')
  async handleReceiveWalletAction (@Body() body: any) {
    return this.analyticsService.handleReceiveWalletAction(body)
  }
}
