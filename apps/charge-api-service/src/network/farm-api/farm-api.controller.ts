import { Controller, Post, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { FarmService } from '@app/api-service/network/farm-api/farm-api.service'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/farm')
export class FarmApiController {
  constructor (private readonly farmService: FarmService) { }

  @Post('deposit')
  deposit () {
    // return this.farmService.deposit()
  }

  @Post('withdraw')
  withdraw () {
    // return this.farmService.withdraw()
  }
}
