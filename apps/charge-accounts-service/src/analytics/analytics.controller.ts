import { Controller, Post, Body } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { MessagePattern } from '@nestjs/microservices'

@Controller('analytics')
export class AnalyticsController {
  constructor (private readonly analyticsService: AnalyticsService) { }

    @MessagePattern('handle-userOp-and-walletAction')
  async handleUserOpAndWalletAction (@Body() body: any) {
    return this.analyticsService.handleUserOpAndWalletAction(body)
  }
}
