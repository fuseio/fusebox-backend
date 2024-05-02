import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors
} from '@nestjs/common'
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath
} from '@nestjs/swagger'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { ConsensusApiService } from '@app/api-service/consensus-api/consensus-api.service'
import { DelegatedAmountsDto } from '@app/network-service/consensus/dto/delegate.dto'
import { DelegatedAmounts } from '@app/network-service/consensus/entities/delegate.entity'
import { WithdrawAmountsDto } from '@app/network-service/consensus/dto/withdraw.dto'
import { WithdrawAmounts } from '@app/network-service/consensus/entities/withdraw.entity'

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
  @ApiOperation({
    summary: 'Get delegated amounts',
    description: 'Fetches the delegated amounts for the specified validators.'
  })
  @ApiBody({
    type: DelegatedAmounts,
    description: 'Delegated amounts for the specified validators.'
  })
  @ApiOkResponse({
    description: 'Delegated amounts for the specified validators.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('DelegatedAmountsByDelegatorsResponse') }
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
  @ApiBody({
    type: DelegatedAmounts,
    description: 'Delegated amounts for the specified validators.'
  })
  @ApiOkResponse({
    description: 'Delegation data.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('TransactionRequest') }
      }
    }
  })
  delegate (@Body() delegatedAmountsDto: DelegatedAmountsDto) {
    return this.consensusApiService.delegate(delegatedAmountsDto.validator)
  }

  @Post('withdraw')
  @ApiOperation({
    summary: 'Withdraw',
    description: 'Gets the data required for withdrawing from a validator.'
  })
  @ApiBody({
    type: WithdrawAmounts,
    description: 'Withdrawal data for the specified validator.'
  })
  @ApiOkResponse({
    description: 'Withdrawal data.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('TransactionRequest') }
      }
    }
  })
  withdraw (@Body() withdrawAmountsDto: WithdrawAmountsDto) {
    return this.consensusApiService.withdraw(withdrawAmountsDto.validator, withdrawAmountsDto.amount)
  }
}
