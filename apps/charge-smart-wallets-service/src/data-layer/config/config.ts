export default () => ({
  tradeApiBaseUrl: process.env.LEGACY_FUSE_TRADE_API_URL,
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
    }
  }
})
