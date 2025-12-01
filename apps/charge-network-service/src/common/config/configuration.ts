export default () => ({
  coinGeckoApiKey: process.env.COIN_GECKO_API_KEY,
  coinGeckoUrl: process.env.COIN_GECKO_URL,
  voltBarAddress: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
  fuseLiquidStakingAddress: '0xa3dc222eC847Aac61FB6910496295bF344Ea46be',
  wfuseAddress: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
  blockRewardAddress: '0x63D4efeD2e3dA070247bea3073BCaB896dFF6C9B',
  consensusAddress: '0x3014ca10b91cb3D0AD85fEf7A3Cb95BCAc9c0f79',
  sfTokenAddress: '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871',

  masterChefV3Address: '0x5fFcEaa947937DE1FEBb28BCa65E84894a55a2EF',

  simpleStakingConfig: {
    '0xc6bc407706b7140ee8eef2f86f9504651b63e7f9': {
      description: 'USDC on Stargate',
      poolId: 1,
      decimals: 6
    },
    '0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590': {
      description: 'WETH on Stargate',
      poolId: 2,
      decimals: 18
    }
  },

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
  erc20SubgraphUrl: 'https://gateway.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/FJc4XambRrE9iEiddypzgWjpaa3DkpTS5tkpypZqSdvx',
  accountAbstractionGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/47700e2a17b911be5b2186cf496a6737/subgraphs/id/hmmXWtoJqnvYaQKrBjXzPzwiXksVHoGrTZGrDi4FRtL',
  voltageV2GraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/550967d6d70d7fce0a710f38dc7bc5df/subgraphs/id/B4BGk9itvmRXzzNRAzBWwQARHRt3ZvLz11aWNVsZPT4',
  liquidStakingFuseGraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/3f81974147b5b63470524ed08206e24e/subgraphs/id/7FQVAoYfsrYPAVzaHnky1rHGYjXj2hcw3yokeLQmpntp',
  voltageV3GraphUrl: 'https://gateway-arbitrum.network.thegraph.com/api/550967d6d70d7fce0a710f38dc7bc5df/subgraphs/id/HzpnoLiTRga8yWaPBPBJjLp1FseiJkiynKDNXXFDKEQc',
  masterChefV3GraphUrl: 'https://gateway.thegraph.com/api/550967d6d70d7fce0a710f38dc7bc5df/subgraphs/id/9co6azYbeUZeW2EfKideZbjR77udKpo8Vz9aisdGnJyx',
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
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      tokenSymbol: 'FUSE',
      tokenName: 'Fuse',
      tokenLogoURI: 'https://raw.githubusercontent.com/voltfinance/token-logos/main/logos/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE/logo.png',
      unStakeTokenAddress: '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871',
      stakingProviderId: 'fuse-liquid-staking',
      expired: false
    }
  ],
  // Staking options have been removed from the config temporarily.
  stakingOptionsV2: [],
  multiCallAddress: '0x3CE6158b7278Bf6792e014FA7B4f3c6c46fe9410',
  botApi: 'https://bot.fuse.io/api/v1'
})
