export interface TokenInfo {
  name: string;
  decimals: string;
  symbol: string;
}

export interface TokenInfoCache {
  [tokenAddress: string]: TokenInfo
}
