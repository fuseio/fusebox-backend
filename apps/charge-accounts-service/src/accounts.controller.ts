import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Health Check')
@Controller()
export class AccountsController {
  @Get('health')
  healthCheck () {
    return 'ok'
  }
}
