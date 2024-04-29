import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors
} from '@nestjs/common'
import { ConsensusApiService } from '@app/api-service/consensus-api/consensus-api.service'
import { DelegatedAmountsDto } from '@app/network-service/consensus/dto/consensus.dto'
import { CacheInterceptor } from '@nestjs/cache-manager'

@Controller('v0/consensus')
@UseInterceptors(CacheInterceptor)
export class ConsensusApiController {
  constructor (
    private readonly consensusApiService: ConsensusApiService
  ) { }

  @Get('validators')
  getValidators () {
    return this.consensusApiService.getValidators()
  }

  @Post('delegated_amounts')
  getDelegatedAmounts (@Body() delegatedAmountsDto: DelegatedAmountsDto) {
    return this.consensusApiService.getDelegatedAmounts(delegatedAmountsDto)
  }

  @Post('delegate')
  delegate (@Body() data: { validator: string }) {
    return this.consensusApiService.delegate(data.validator)
  }

  @Post('withdraw')
  withdraw (@Body() data: { validator: string, amount: string }) {
    return this.consensusApiService.withdraw(data.validator, data.amount)
  }
}
