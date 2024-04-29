import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { StakingAPIService } from '@app/api-service/staking-api/staking-api.service'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { ApiOperation, ApiParam, ApiBody, ApiTags, ApiForbiddenResponse, ApiCreatedResponse, ApiOkResponse, ApiQuery } from '@nestjs/swagger'
import { StakingOption } from '@app/network-service/staking/interfaces'
import { Stake } from '@app/network-service/staking/entities/stake.entity'
import { Unstake } from '@app/network-service/staking/entities/unstake.entity'

@ApiTags('Staking')
@UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/staking')
export class StakingApiController {
  constructor (
    private readonly stakingAPIService: StakingAPIService
  ) { }

  @Get('staking_options')
  @ApiOperation({
    summary: 'Retrieve staking options',
    description: 'Fetches available staking options including details like APR, token information, and provider IDs.'
  })
  @ApiQuery({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiOkResponse({
    description: 'A list of staking options.',
    type: Array<StakingOption>,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/StakingOptionsResponse'
        }
      }
    }
  })
  stakingOptions () {
    return this.stakingAPIService.stakingOptions()
  }

  @Post('stake')
  @ApiOperation({
    summary: 'Stake tokens',
    description: 'Stakes a specified amount of tokens from a wallet.'
  })
  @ApiQuery({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiBody({ type: Stake, required: true })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiCreatedResponse({
    description: 'Token staking initiated successfully.',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/StakeResponse'
        }
      }
    }
  })
  stake (@Body() stakeDto: StakeDto) {
    return this.stakingAPIService.stake(stakeDto)
  }

  @Post('unstake')
  @ApiOperation({
    summary: 'Unstake tokens',
    description: 'Unstakes a specified amount of tokens back to a wallet.'
  })
  @ApiQuery({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiBody({ type: Unstake, required: true })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiCreatedResponse({
    description: 'Token unstaking initiated successfully.',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/StakeResponse'
        }
      }
    }
  })
  unstake (@Body() unstakeDto: UnstakeDto) {
    return this.stakingAPIService.unStake(unstakeDto)
  }

  @Get('staked_tokens/:accountAddress')
  @ApiOperation({
    summary: 'Get staked tokens by wallet address',
    description: 'Retrieves information about tokens staked by a specific wallet address.'
  })
  @ApiQuery({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiParam({ name: 'accountAddress', type: String, required: true, description: 'The wallet address to query staked tokens for.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiOkResponse({
    description: 'Staked tokens information for the specified wallet address.',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/StakedTokensResponse'
        }
      }
    }
  })
  stakedTokens (@Param('accountAddress') accountAddress: string) {
    return this.stakingAPIService.stakedTokens(accountAddress)
  }
}
