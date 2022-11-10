import { Controller, Get } from '@nestjs/common'

@Controller()
export class AccountsController {
  @Get('health')
  healthCheck () {
    return 'ok'
  }
}
