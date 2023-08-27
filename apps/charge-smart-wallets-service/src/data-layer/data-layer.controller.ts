import { DataLayerService } from '@app/smart-wallets-service/data-layer/data-layer.service'
import { Body, Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { UserOp } from './interfaces/user-op.interface'

@Controller()
export class DataLayerController {
  constructor (private readonly dataLayerService: DataLayerService) { }

  @MessagePattern('record-user-op')
  create (@Body() userOp: UserOp) {
    return this.dataLayerService.recordUserOp(userOp)
  }

  @MessagePattern('update-user-op')
  update (@Body() userOp: UserOp) {
    return this.dataLayerService.updateUserOp(userOp)
  }
}
