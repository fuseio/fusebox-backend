export default () => ({
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  coinGeckoApiKey: process.env.COIN_GECKO_API_KEY,
  coinGeckoUrl: process.env.COIN_GECKO_URL,
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io',
      networkName: process.env.NETWORK_NAME || 'fuse',
      chainId: parseInt(process.env.CHAIN_ID) || 122
    }
  }
})
