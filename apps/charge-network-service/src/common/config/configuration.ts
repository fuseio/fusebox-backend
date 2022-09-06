export default () => ({
  voltBarAddress: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
    }
  },
  tradeApiBaseUrl: process.env.LEGACY_FUSE_TRADE_API_URL,
  voltBarGraphUrl: process.env.VOLT_BAR_GRAPH_URL,
  blockGraphUrl: process.env.BLOCK_GRAPH_URL,
  voltageGraphUrl: process.env.VOLTAGE_GRAPH_URL
})
