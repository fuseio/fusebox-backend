export default () => ({
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL,
      networkName: process.env.NETWORK_NAME,
      chainId: parseInt(process.env.CHAIN_ID)
    },
    timeoutInterval: process.env.TIMEOUT_INTERVAL
  }
})
