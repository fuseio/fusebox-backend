import { Controller, Body } from '@nestjs/common'
import { TrackerService } from '@app/accounts-service/analytics/analytics.service'
import { MessagePattern } from '@nestjs/microservices'

@Controller('analytics')
export class AnalyticsController {
  constructor (private readonly trackerService: TrackerService) { }

  @MessagePattern('handle-userOp-and-walletAction')
  async handleUserOpAndWalletAction (@Body() body: any) {
    return this.trackerService.handleUserOpAndWalletAction(body)
  }

  @MessagePattern('handle-receive-walletAction')
  async handleReceiveWalletAction (@Body() body: any) {
    return this.trackerService.handleReceiveWalletAction(body)
  }
}
