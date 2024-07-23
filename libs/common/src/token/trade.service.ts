import { HttpService } from '@nestjs/axios'
import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom } from 'rxjs'
import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export default class TradeService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }
  private readonly API_URL = 'https://pro-api.coingecko.com/api/v3'

  async getTokenPriceByAddress(tokenAddress: string): Promise<number> {
    const cacheKey = `token_price_${tokenAddress.toLowerCase()}`;
    const cachedPrice = await this.cacheManager.get<number>(cacheKey);

    if (cachedPrice !== undefined) {
      return cachedPrice;
    }

    const apiKey = this.configService.get<string>('coinGeckoApiKey');
    if (!apiKey) throw new Error('CoinGecko API key is not configured');

    const address = tokenAddress.toLowerCase();
    const isNativeFuse = address === NATIVE_FUSE_TOKEN.address.toLowerCase();

    let url: string;
    let params: Record<string, string>;

    if (isNativeFuse) {
      url = `${this.API_URL}/simple/price`;
      params = { ids: 'fuse-network-token', vs_currencies: 'usd' };
    } else {
      url = `${this.API_URL}/simple/token_price/fuse`;
      params = { contract_addresses: address, vs_currencies: 'usd' };
    }

    try {
      const { data } = await lastValueFrom(this.httpService.get<Record<string, { usd: number }>>(
        url,
        {
          params,
          headers: {
            'accept': 'application/json',
            'x-cg-pro-api-key': apiKey
          }
        }
      ));

      const key = isNativeFuse ? 'fuse-network-token' : address;
      const price = data[key]?.usd ?? 0;

      await this.cacheManager.set(cacheKey, price, 300000); // Cache for 5 minutes (300000 ms)

      return price;
    } catch (error) {
      throw new Error(`Failed to fetch price for token ${address}: ${error.message}`);
    }
  }
}