export default () => ({
  CHARGE_BASE_URL: process.env.CHARGE_BASE_URL,
  CHARGE_PUBLIC_KEY: process.env.CHARGE_PUBLIC_KEY,
  paymentsAllowedTokens: [
    {
      tokenSymbol: 'USDC',
      tokenAddress: '0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5',
      contract_address: '0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5',
      contract_decimals: 6,
      logo_url: 'https://assets.unmarshal.io/tokens/fuse_0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5.png'
    },
    {
      tokenSymbol: 'FUSE',
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      contract_address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      contract_decimals: 18,
      logo_url: 'https://assets.unmarshal.io/tokens/fuse_0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png'
    },
    {
      tokenSymbol: 'G$',
      tokenAddress: '0x495d133B938596C9984d462F007B676bDc57eCEC',
      contract_address: '0x495d133b938596c9984d462f007b676bdc57ecec',
      contract_decimals: 2,
      logo_url: 'https://raw.githubusercontent.com/voltfinance/token-logos/main/logos/0x495d133B938596C9984d462F007B676bDc57eCEC/logo.png'
    }
  ],
  ethereumPaymentsAllowedTokens: [
    {
      tokenSymbol: 'USDC',
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      contract_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      contract_decimals: 6,
      logo_url: 'https://assets.unmarshal.io/tokens/ethereum_0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png'
    }
  ],
  goerliPaymentsAllowedTokens: [
    {
      tokenSymbol: 'USDC',
      tokenAddress: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
      contract_address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
      contract_decimals: 6,
      logo_url: 'https://assets.unmarshal.io/tokens/ethereum_0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png'
    }
  ]
})
