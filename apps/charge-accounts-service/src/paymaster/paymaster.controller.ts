import {
  Controller,
  Param,
  Post,
  UseGuards, Get
} from '@nestjs/common'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { IsProjectOwnerGuard } from '@app/accounts-service/projects/guards/is-project-owner.guard'
import { PaymasterService } from '@app/accounts-service/paymaster/paymaster.service'
import { MessagePattern } from '@nestjs/microservices'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Paymaster')
@Controller({ path: 'paymaster', version: '1' })
export class PaymasterController {
  constructor (private readonly paymasterService: PaymasterService) { }

  @UseGuards(JwtAuthGuard)
  @Get('version-list')
  @ApiOperation({ summary: 'Get available paymaster version list.' })
  getAvailableVersionList () {
    return this.paymasterService.getAvailableVersionList()
  }

  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Post(':id')
  @ApiOperation({ summary: 'Create a new paymaster for the project.' })
  create (@Param('id') id: string) {
    return this.paymasterService.create(id, '0_1_0')
  }

  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get active paymasters for the project.' })
  findActivePaymasters (@Param('id') id: string) {
    return this.paymasterService.findActivePaymasters(id)
  }

  @MessagePattern('get_paymaster_info')
  findActiveByProjectIdAndEnv (idAndEnv: object) {
    return this.paymasterService.findOneByProjectIdAndEnv(idAndEnv)
  }
}
