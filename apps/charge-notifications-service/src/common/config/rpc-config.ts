export default () => ({
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io',
      networkName: process.env.NETWORK_NAME,
      chainId: parseInt(process.env.CHAIN_ID),
      maxBlocksToProcess: parseInt(process.env.MAX_BLOCKS) || 10000
    },
    fullArchiveRpc: {
      url: process.env.FULL_ARCHIVE_RPC_URL || 'https://explorer-node.fuse.io'
    },
    timeoutInterval: process.env.TIMEOUT_INTERVAL
  }
})
