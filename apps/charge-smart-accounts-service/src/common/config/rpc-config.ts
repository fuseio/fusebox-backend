export default () => ({
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io',
      networkName: process.env.NETWORK_NAME,
      chainId: parseInt(process.env.CHAIN_ID)
    }
  }
})
