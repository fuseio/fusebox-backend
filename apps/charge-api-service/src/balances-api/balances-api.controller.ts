import { Controller, Get, Param, UseGuards, Query, UseInterceptors } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { BalancesAPIService } from '@app/api-service/balances-api/balances-api.service'
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger'
import { CacheInterceptor } from '@nestjs/cache-manager'

@ApiTags('Balances - ERC20 & NFT')
@UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/balances')
@UseInterceptors(CacheInterceptor)
export class BalancesAPIController {
  constructor(
    private readonly balancesAPIService: BalancesAPIService
  ) { }

  @Get('assets/:address')
  @ApiOperation({
    summary: 'Get Fungible ERC20 Token Balances',
    description: 'Retrieve a comprehensive list of ERC20 token holdings for a specific address, including the balance of native token. Our API provides real-time price information and token details for enhanced visibility and analysis.'
  })
  @ApiQuery({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiParam({ name: 'address', type: String, required: true, description: 'The wallet address to query for ERC20 token balances.' })
  @ApiQuery({ name: 'tokenAddress', type: String, required: false, description: 'Optional. Filter results by a specific token address.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  getERC20TokenBalances(
    @Param('address') address: string,
    @Query('tokenAddress') tokenAddress?: string
  ) {
    return this.balancesAPIService.getERC20TokenBalances(address, tokenAddress)
  }

  @Get('nft-assets/:address')
  @ApiOperation({
    summary: 'Get Non Fungible NFT Token Balances',
    description: 'The NFT Assets API allows retrieval of all non-fungible ERC-721 and ERC-1155 NFT assets held by an address with cursor-based pagination.'
  })
  @ApiQuery({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of records to be fetched per page. Default is 100, max is 100.' })
  @ApiQuery({ name: 'cursor', type: String, required: false, description: 'Cursor for pagination. Use the cursor from the previous response to fetch the next page.' })
  @ApiParam({ name: 'address', type: String, required: true, description: 'The wallet address to query for ERC721 token balances.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiOkResponse({
    description: 'A list of NFTs associated with the wallet address.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('CollectiblesResponse') }
      }
    }
  })
  getERC721TokenBalances(
    @Param('address') address: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string
  ) {
    return this.balancesAPIService.getERC721TokenBalances(address, limit, cursor)
  }
}
