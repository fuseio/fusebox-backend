import { BlocksClient } from '@app/network-service/voltage-dex/services/blocks-client.service'
import { Injectable } from '@nestjs/common'
import { TokenAddressMapper } from '@app/network-service/voltage-dex/services/token-address-mapper.service'
import { TokenPriceDto } from '@app/network-service/voltage-dex/dto/token-price.dto'
import { VoltageV2Client } from '@app/network-service/voltage-dex/services/voltage-v2-client.service'
import { VoltageV3Client } from '@app/network-service/voltage-dex/services/voltage-v3-client.service'
import dayjs from '@app/common/utils/dayjs'

@Injectable()
export class TokenPriceService {
  constructor (
    private voltageV2Client: VoltageV2Client,
    private voltageV3Client: VoltageV3Client,
    private blocksClient: BlocksClient,
    private tokenAddressMapper: TokenAddressMapper
  ) {}

  async getTokenPrice (tokenPriceDto: TokenPriceDto): Promise<string> {
    const address = this.tokenAddressMapper.getTokenAddress(tokenPriceDto.tokenAddress)

    const v3Price = await this.voltageV3Client.getTokenPrice(address)
    if (v3Price) {
      return v3Price
    }

    return this.voltageV2Client.getTokenPrice(address)
  }

  async getTokenPriceChange (tokenPriceDto: TokenPriceDto) {
    const [currentPrice, previousPrice] = await Promise.all([
      this.getTokenPrice(tokenPriceDto),
      this.getPreviousTokenPrice(tokenPriceDto)
    ])
    const priceChange = this.calculatePercentChange(currentPrice, previousPrice)
    return { priceChange: priceChange.toString(), currentPrice, previousPrice }
  }

  private async getPreviousTokenPrice (tokenPriceDto: TokenPriceDto): Promise<string> {
    const address = this.tokenAddressMapper.getTokenAddress(tokenPriceDto.tokenAddress)
    const duration = tokenPriceDto.duration
      ? dayjs.duration(tokenPriceDto.duration)
      : dayjs.duration(1, 'days')
    const previousTimestamp = await this.blocksClient.getPreviousBlock(duration)
    const oneDayHighBlock = await this.getTokenData(address, previousTimestamp)
    return oneDayHighBlock?.priceUSD
  }

  private calculatePercentChange (valueNow: string, valueBefore: string): number {
    const adjustedPercentChange =
      ((parseFloat(valueNow) - parseFloat(valueBefore)) / parseFloat(valueBefore)) * 100
    if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
      return 0
    }
    return adjustedPercentChange
  }

  async getTokenData (tokenAddress: string, fromTimestamp?: number) {
    // Query V3
    const v3Result = await this.voltageV3Client.getTokenData(tokenAddress, fromTimestamp)

    // If V3 has data, return it
    if (v3Result) {
      return v3Result
    }

    // If V3 doesn't have data, query V2
    return this.voltageV2Client.getTokenData(tokenAddress, fromTimestamp)
  }
}