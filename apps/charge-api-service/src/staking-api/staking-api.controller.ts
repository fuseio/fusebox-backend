import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { StakingAPIService } from '@app/api-service/staking-api/staking-api.service'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { ApiOperation, ApiParam, ApiBody, ApiTags, ApiForbiddenResponse, ApiCreatedResponse } from '@nestjs/swagger'
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
  @ApiOperation({ summary: 'Fetches available staking options including details like APR, token information, and provider IDs.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCreatedResponse({ description: 'A list of staking options.', type: Array<StakingOption> })
  stakingOptions () {
    return this.stakingAPIService.stakingOptions()
  }

  @Post('stake')
  @ApiOperation({ summary: 'Stakes a specified amount of tokens from a wallet.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiBody({ type: Stake, required: true })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCreatedResponse({ description: 'The transaction object.', type: Object })
  stake (@Body() stakeDto: StakeDto) {
    return this.stakingAPIService.stake(stakeDto)
  }

  @Post('unstake')
  @ApiOperation({ summary: 'Unstakes a specified amount of tokens back to a wallet.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiBody({ type: Unstake, required: true })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCreatedResponse({ description: 'The transaction object.', type: Object })
  unstake (@Body() unstakeDto: UnstakeDto) {
    return this.stakingAPIService.unStake(unstakeDto)
  }

  @Get('staked_tokens/:accountAddress')
  @ApiOperation({ summary: 'Retrieves information about tokens staked by a specific wallet address.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiParam({ name: 'accountAddress', type: String, required: true })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCreatedResponse({ description: 'Staked tokens information for the specified wallet address.', type: Object })
  stakedTokens (@Param('accountAddress') accountAddress: string) {
    return this.stakingAPIService.stakedTokens(accountAddress)
  }
}
