import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { FarmService } from './farm.service'

@Controller('farm')
export class FarmController {
  constructor (private readonly farmService: FarmService) { }
  @MessagePattern('deposit')
  deposit () { }

  @MessagePattern('withdraw')
  withdraw () { }
}
