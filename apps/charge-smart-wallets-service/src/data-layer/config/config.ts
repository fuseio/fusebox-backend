export default () => ({
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
    }
  }
})
