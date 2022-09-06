import { voltBarId } from './staking-providers'

export const stakingOptions = [
  {
    tokenAddress: process.env.VOLT_ADDRESS,
    tokenSymbol: 'VOLT',
    tokenName: 'VoltToken',
    tokenLogoURI: 'https://raw.githubusercontent.com/voltfinance/token-logos/main/logos/0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4/logo.png',
    stakingProviderId: voltBarId
  }
]
