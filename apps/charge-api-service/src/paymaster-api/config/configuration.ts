export default () => ({
  paymasterApi: {
    production: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
    },
    sandbox: {
      url: process.env.SPARK_PRC_URL || 'https://rpc.fusespark.io/'
    },
    '0_1_0': {
      productionPrivateKey: process.env.PAYMASTER_PRODUCTION_SIGNER_PRIVATE_KEY_V_0_1_0,
      sandboxPrivateKey: process.env.PAYMASTER_SANDBOX_SIGNER_PRIVATE_KEY_V_0_1_0
    }
  }
})
