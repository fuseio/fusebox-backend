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
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
    }
  },
  tradeApiBaseUrl: process.env.LEGACY_FUSE_TRADE_API_URL,
  voltBarGraphUrl: 'https://api.thegraph.com/subgraphs/name/t0mcr8se/voltbar',
  blockGraphUrl: 'https://api.thegraph.com/subgraphs/name/fuseio/fuse-blocks',
  voltageGraphUrl: 'https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange',
  stakingOptions: [
    {
      tokenAddress: '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4',
      tokenSymbol: 'VOLT',
      tokenName: 'VoltToken',
      tokenLogoURI: 'https://raw.githubusercontent.com/voltfinance/token-logos/main/logos/0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4/logo.png',
      unStakeTokenAddress: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
      stakingProviderId: 'volt-bar'
    },
    {
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      tokenSymbol: 'FUSE',
      tokenName: 'Fuse',
      tokenLogoURI: 'https://raw.githubusercontent.com/voltfinance/token-logos/main/logos/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE/logo.png',
      unStakeTokenAddress: '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871',
      stakingProviderId: 'fuse-liquid-staking'
    }
  ]
})
