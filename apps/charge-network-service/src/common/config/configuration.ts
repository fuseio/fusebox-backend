export default () => ({
  voltBarAddress: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
  fuseLiquidStakingAddress: '0xa3dc222eC847Aac61FB6910496295bF344Ea46be',
  wfuseAddress: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
  blockRewardAddress: '0x63D4efeD2e3dA070247bea3073BCaB896dFF6C9B',
  consensusAddress: '0x3014ca10b91cb3D0AD85fEf7A3Cb95BCAc9c0f79',
  sfTokenAddress: '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871',
  validatorFee: '0.15',
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io',
      networkName: process.env.NETWORK_NAME || 'Fuse Mainnet',
      chainId: parseInt(process.env.CHAIN_ID) || 122
    }
  },
  tradeApiBaseUrl: process.env.LEGACY_FUSE_TRADE_API_URL,
  voltBarGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/AH6ViHt7LJJEiBJPBY1u7RQF737CRs4uk6a9uvMcSTZJ',
  blockGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/4NdGNtBYVAuWriUfcb58vLmiaendp7v8EQ9tGe3i1RPo',
  voltageGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/4buFyoUT8Lay3T1DK9ctdMdcpkZMdi5EpCBWZCBTKvQd',
  nftGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/36MBsLQLDobyKmN9NWW5bStUS5GdXjK6mmKytMxcWFbq',
  accountAbstractionGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/hmmXWtoJqnvYaQKrBjXzPzwiXksVHoGrTZGrDi4FRtL',
  stakingOptions: [
    {
      tokenAddress: '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4',
      tokenSymbol: 'VOLT',
      tokenName: 'VoltToken',
      tokenLogoURI: 'https://raw.githubusercontent.com/voltfinance/token-logos/main/logos/0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4/logo.png',
      unStakeTokenAddress: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
      stakingProviderId: 'volt-bar',
      expired: true
    },
    {
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      tokenSymbol: 'FUSE',
      tokenName: 'Fuse',
      tokenLogoURI: 'https://raw.githubusercontent.com/voltfinance/token-logos/main/logos/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE/logo.png',
      unStakeTokenAddress: '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871',
      stakingProviderId: 'fuse-liquid-staking',
      expired: false
    }
  ],
  multiCallAddress: '0x3CE6158b7278Bf6792e014FA7B4f3c6c46fe9410',
  botApi: 'https://bot.fuse.io/api/v1'
})
