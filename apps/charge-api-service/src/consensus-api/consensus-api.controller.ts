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
import { ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger'

@ApiTags('Consensus')
@Controller('v0/consensus')
@UseInterceptors(CacheInterceptor)
export class ConsensusApiController {
  constructor (
    private readonly consensusApiService: ConsensusApiService
  ) { }

  @Get('validators')
  @ApiOperation({
    summary: 'Get validators',
    description: 'Fetches the list of validators in the network with their respective details.'
  })
  @ApiOkResponse({
    description: 'List of validators with their details.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('ValidatorsResponse') }
      }
    }
  })
  getValidators () {
    return this.consensusApiService.getValidators()
  }

  @Post('delegated_amounts')
  @ApiOkResponse({
    description: 'Delegated amounts for the specified validators.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('DelegatedAmountsResponse') }
      }
    }
  })
  getDelegatedAmounts (@Body() delegatedAmountsDto: DelegatedAmountsDto) {
    return this.consensusApiService.getDelegatedAmounts(delegatedAmountsDto)
  }

  @Post('delegate')
  @ApiOperation({
    summary: 'Delegate',
    description: 'Gets the data required for delegating to a validator.'
  })
  @ApiOkResponse({
    description: 'Delegation data.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('DelegateResponse') }
      }
    }
  })
  delegate (@Body() data: { validator: string }) {
    return this.consensusApiService.delegate(data.validator)
  }

  @Post('withdraw')
  @ApiOperation({
    summary: 'Withdraw',
    description: 'Gets the data required for withdrawing from a validator.'
  })
  @ApiOkResponse({
    description: 'Withdrawal data.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('WithdrawResponse') }
      }
    }
  })
  withdraw (@Body() data: { validator: string, amount: string }) {
    return this.consensusApiService.withdraw(data.validator, data.amount)
  }
}
