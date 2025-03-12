import { VoltBarClient } from '@app/network-service/voltage-dex/services/volt-bar-client.service'
import { BlocksClient } from '@app/network-service/voltage-dex/services/blocks-client.service'
import { Injectable, Logger } from '@nestjs/common'
import { TokenAddressMapper } from '@app/network-service/voltage-dex/services/token-address-mapper.service'
import { TokenPriceDto } from '@app/network-service/voltage-dex/dto/token-price.dto'
import { VoltageV2Client } from '@app/network-service/voltage-dex/services/voltage-v2-client.service'
import { VoltageV3Client } from '@app/network-service/voltage-dex/services/voltage-v3-client.service'
import dayjs from '@app/common/utils/dayjs'
import { MultipleTokenPricesDto } from '../dto/multiple-token-prices.dto'
import { TokenPrices } from '../types'

@Injectable()
export class TokenPriceService {
  private readonly logger = new Logger(TokenPriceService.name)

  private readonly XVOLT_ADDRESS = '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1'

  constructor (
    private voltageV2Client: VoltageV2Client,
    private voltageV3Client: VoltageV3Client,
    private voltBarClient: VoltBarClient,
    private blocksClient: BlocksClient,
    private tokenAddressMapper: TokenAddressMapper
  ) {}

  async getTokenPrice (tokenPriceDto: TokenPriceDto): Promise<string> {
    const { tokenAddress } = tokenPriceDto
    this.logger.log(`Getting token price for ${tokenAddress}`)

    if (tokenAddress.toLowerCase() === this.XVOLT_ADDRESS.toLowerCase()) {
      return this.getXVoltPrice()
    }

    try {
      const address = this.tokenAddressMapper.getTokenAddress(tokenAddress)
      const price = await this.getPriceFromClients(address)

      this.logger.log(`Got token price for ${tokenAddress}`)
      return price
    } catch (error) {
      this.logger.error(`Error getting token price for ${tokenAddress}`, error)
      return '0'
    }
  }

  async getMultipleTokenPrices (multipleTokenPricesDto: MultipleTokenPricesDto) {
    try {
      const tokenAddresses = multipleTokenPricesDto.tokenAddresses.map(
        address => this.tokenAddressMapper.getTokenAddress(address)
      )

      const prices = await this.voltageV3Client.getMultipleTokenPrices(
        tokenAddresses
      )

      const tokensWithoutPrices: TokenPrices = {}
      const tokensWithPrices: TokenPrices = {}

      for (const [address, price] of Object.entries(prices)) {
        if (price === null) {
          tokensWithoutPrices[address] = price
        } else {
          tokensWithPrices[address] = price
        }
      }

      const tokensWithoutPricesArray = Object.keys(tokensWithoutPrices)
      const v2Prices = await this.voltageV2Client.getMultipleTokenPrices(tokensWithoutPricesArray)

      return { ...v2Prices, ...tokensWithPrices }
    } catch (err) {
      this.logger.error('Error getting multiple token prices', err)
      return []
    }
  }

  private async getXVoltPrice (): Promise<string> {
    const [ratio, voltPrice] = await Promise.all([
      this.voltBarClient.getRatio(),
      this.getTokenPrice({ tokenAddress: '0x34ef2cc892a88415e9f02b91bfa9c91fc0be6bd4' })
    ])

    return (parseFloat(ratio) * parseFloat(voltPrice)).toString()
  }

  private async getPriceFromClients (address: string): Promise<string> {
    const v3Price = await this.voltageV3Client.getTokenPrice(address)
    if (v3Price) {
      this.logger.log('Got token price from V3')
      return v3Price
    }

    const v2Price = await this.voltageV2Client.getTokenPrice(address)
    this.logger.log('Got token price from V2')
    return v2Price
  }

  async getTokenPriceChange (tokenPriceDto: TokenPriceDto) {
    this.logger.log(`Getting token price change for ${tokenPriceDto.tokenAddress}`)
    try {
      const [currentPrice, previousPrice] = await Promise.all([
        this.getTokenPrice(tokenPriceDto),
        this.getPreviousTokenPrice(tokenPriceDto)
      ])
      const priceChange = this.calculatePercentChange(currentPrice, previousPrice)
      this.logger.log(`Got token price change for ${tokenPriceDto.tokenAddress}`)
      return { priceChange: priceChange.toString(), currentPrice, previousPrice }
    } catch (error) {
      this.logger.error(`Error getting token price change for ${tokenPriceDto.tokenAddress}`, error)
      return { priceChange: '0', currentPrice: '0', previousPrice: '0' }
    }
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
