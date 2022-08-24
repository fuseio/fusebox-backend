export default () => ({
  blockRewardAddress: '0x63D4efeD2e3dA070247bea3073BCaB896dFF6C9B',
  consensusAddress: '0x3014ca10b91cb3D0AD85fEf7A3Cb95BCAc9c0f79',
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
      // networkName: process.env.NETWORK_NAME,
      // chainId: parseInt(process.env.CHAIN_ID),
      // maxBlocksToProcess: parseInt(process.env.MAX_BLOCKS) || 10000
    }
  }
})
