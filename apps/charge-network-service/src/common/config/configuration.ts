export default () => ({
  voltBarAddress: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
    }
  },
  tradeApiBaseUrl: process.env.LEGACY_FUSE_TRADE_API_URL,
  voltBarGraphUrl: 'https://api.thegraph.com/subgraphs/name/diegofigs/voltfinance-bar',
  blockGraphUrl: 'https://api.thegraph.com/subgraphs/name/fuseio/fuse-blocks',
  voltageGraphUrl: 'https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange',
  stakingOptions: [
    {
      tokenAddress: '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4',
      tokenSymbol: 'VOLT',
      tokenName: 'VoltToken',
      tokenLogoURI: 'https://raw.githubusercontent.com/voltfinance/token-logos/main/logos/0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4/logo.png',
      stakingProviderId: 'volt-bar'
    }
  ]
})
