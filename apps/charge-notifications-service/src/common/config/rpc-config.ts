export default () => ({
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL,
      networkName: process.env.NETWORK_NAME,
      chainId: parseInt(process.env.CHAIN_ID),
      maxBlocksToProcess: parseInt(process.env.MAX_BLOCKS) || 10000
    },
    timeoutInterval: process.env.TIMEOUT_INTERVAL
  }
})
