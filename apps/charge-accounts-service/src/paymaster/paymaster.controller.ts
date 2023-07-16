import {
  Controller,
  Param,
  Post,
  UseGuards
} from '@nestjs/common'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { IsProjectOwnerGuard } from '@app/accounts-service/projects/guards/is-project-owner.guard'
import { PaymasterService } from '@app/accounts-service/paymaster/paymaster.service'
import { MessagePattern } from '@nestjs/microservices'

@Controller({ path: 'paymaster', version: '1' })
export class PaymasterController {
  constructor(private readonly paymasterService: PaymasterService) { }

  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Post(':id')
  create(@Param('id') id: string) {
    return this.paymasterService.create(id)
  }


  @MessagePattern('get_paymaster_info')
  findOne(projectId: string) {
    return this.paymasterService.findOne(projectId)
  }


}