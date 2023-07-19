export default () => ({
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
    }
  },
  'PAYMASTER_SIGNER_PRIVATE_KEY': 'f70fc4ec024918939dce57bc1c3138c34e7d6a08f17f1d43be7d10b2c8465e7f',
  'PAYMASTER_CONTRACT_ADDRESS': '0xb234cb63B4A016aDE53E900C667a3FC3C5Cc8F46'
})
