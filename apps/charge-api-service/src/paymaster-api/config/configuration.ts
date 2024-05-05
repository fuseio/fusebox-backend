export default () => ({
  paymasterApi: {
    production: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io',
      networkName: process.env.NETWORK_NAME || 'Fuse Mainnet',
      chainId: parseInt(process.env.CHAIN_ID) || 122
    },
    sandbox: {
      url: process.env.SPARK_RPC_URL || 'https://rpc.fusespark.io/',
      networkName: 'Fuse Spark',
      chainId: parseInt(process.env.CHAIN_ID) || 123
    },
    keys: {
      '0_1_0': {
        productionPrivateKey: process.env.PAYMASTER_PRODUCTION_SIGNER_PRIVATE_KEY_V_0_1_0,
        sandboxPrivateKey: process.env.PAYMASTER_SANDBOX_SIGNER_PRIVATE_KEY_V_0_1_0
      }
    }
  }
})
