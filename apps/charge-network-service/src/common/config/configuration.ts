export default () => ({
  coinGeckoApiKey: process.env.COIN_GECKO_API_KEY,
  coinGeckoUrl: process.env.COIN_GECKO_URL,
  voltBarAddress: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
  fuseLiquidStakingAddress: '0xa3dc222eC847Aac61FB6910496295bF344Ea46be',
  wfuseAddress: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
  blockRewardAddress: '0x63D4efeD2e3dA070247bea3073BCaB896dFF6C9B',
  consensusAddress: '0x3014ca10b91cb3D0AD85fEf7A3Cb95BCAc9c0f79',
  sfTokenAddress: '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871',

  masterChefV3Address: '0xE3e184a7b75D0Ae6E17B58F5283b91B4E0A2604F',
  usdcOnStargateAddress: '0xc6Bc407706B7140EE8Eef2f86F9504651b63e7f9',
  wethOnStargateAddress: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
  usdcOnStargatePoolId: '31',
  wethOnStargatePoolId: '32',

  validatorFee: '0.15',
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io',
      networkName: process.env.NETWORK_NAME || 'Fuse Mainnet',
      chainId: parseInt(process.env.CHAIN_ID) || 122
    }
  },
  voltBarGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/AH6ViHt7LJJEiBJPBY1u7RQF737CRs4uk6a9uvMcSTZJ',
  blockGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/4NdGNtBYVAuWriUfcb58vLmiaendp7v8EQ9tGe3i1RPo',
  voltageGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/4buFyoUT8Lay3T1DK9ctdMdcpkZMdi5EpCBWZCBTKvQd',
  nftGraphUrl: 'https://gateway.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/GE83YjCJaNbsKnSATYhKCFHwkcVWnT7VNfa5rcqdDuBd',
  accountAbstractionGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/hmmXWtoJqnvYaQKrBjXzPzwiXksVHoGrTZGrDi4FRtL',
  voltageV2GraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/550967d6d70d7fce0a710f38dc7bc5df/subgraphs/id/B4BGk9itvmRXzzNRAzBWwQARHRt3ZvLz11aWNVsZPT4',
  liquidStakingFuseGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/3f81974147b5b63470524ed08206e24e/subgraphs/id/7FQVAoYfsrYPAVzaHnky1rHGYjXj2hcw3yokeLQmpntp',
  voltageV3GraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/550967d6d70d7fce0a710f38dc7bc5df/subgraphs/id/HzpnoLiTRga8yWaPBPBJjLp1FseiJkiynKDNXXFDKEQc',
  masterChefV3GraphUrl: 'https://gateway.thegraph.com/api/550967d6d70d7fce0a710f38dc7bc5df/subgraphs/id/4DwVLaAaEuutpoCwmGUNBS45mSnGABt42u1Qbf73BqbR',
  unmarshal: {
    baseUrl: process.env.UNMARSHAL_BASE_URL || 'https://api.unmarshal.com',
    apiKey: process.env.UNMARSHAL_AUTH_KEY
  },
  explorer: {
    baseUrl: process.env.EXPLORER_API_URL || 'https://explorer.fuse.io/api',
    apiKey: process.env.EXPLORER_API_KEY
  },
  primaryService: process.env.PRIMARY_SERVICE || 'unmarshal',
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
  stakingOptionsV2: [
    {
      tokenAddress: '0xc6Bc407706B7140EE8Eef2f86F9504651b63e7f9',
      tokenSymbol: 'USDC',
      tokenName: 'USD Coin',
      tokenLogoURI:
        'https://raw.githubusercontent.com/voltfinance/token-logos/main/logos/0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5/logo.png',
      unStakeTokenAddress: '0xc6Bc407706B7140EE8Eef2f86F9504651b63e7f9',
      stakingProviderId: 'usdc-on-stargate-simple-staking',
      expired: false
    },
    {
      tokenAddress: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
      tokenSymbol: 'WETH',
      tokenName: 'Wrapped Ether',
      tokenLogoURI:
        'https://raw.githubusercontent.com/voltfinance/token-logos/main/logos/0xa722c13135930332Eb3d749B2F0906559D2C5b99/logo.png',
      unStakeTokenAddress: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
      stakingProviderId: 'weth-on-stargate-simple-staking',
      expired: false
    }
  ],
  multiCallAddress: '0x3CE6158b7278Bf6792e014FA7B4f3c6c46fe9410',
  botApi: 'https://bot.fuse.io/api/v1'
})
