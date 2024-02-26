export default () => ({
  fuseSdkApiKey: process.env.FUSE_SDK_API_KEY,
  fuseSdkPrivateKey: process.env.FUSE_SDK_PRIVATE_KEY,
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
    }
  }
})
