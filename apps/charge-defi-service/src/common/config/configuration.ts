export default () => ({
  blockRewardAddress: '0x63D4efeD2e3dA070247bea3073BCaB896dFF6C9B',
  consensusAddress: '0x3014ca10b91cb3D0AD85fEf7A3Cb95BCAc9c0f79',
  defaultValidator: '0x28C32719Fe055cb959404f9c783eF731f1150DCE',
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
    }
  }
})
