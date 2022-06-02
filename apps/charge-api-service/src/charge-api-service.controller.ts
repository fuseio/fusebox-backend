import { Controller, Get } from '@nestjs/common'
import { ChargeApiServiceService } from '@app/api-service/charge-api-service.service'

@Controller()
export class ChargeApiServiceController {
  constructor (
    private readonly chargeApiServiceService: ChargeApiServiceService
  ) {}

  @Get()
  getHello (): string {
    return this.chargeApiServiceService.getHello()
  }
}
