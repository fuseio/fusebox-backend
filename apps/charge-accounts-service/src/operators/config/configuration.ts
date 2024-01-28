export default () => ({
  paymaster: {
    '0_1_0': {
      production: {
        paymasterContractAddress:
          process.env.PAYMASTER_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0,
        url: process.env.RPC_URL || 'https://rpc.fuse.io'
      },
      sandbox: {
        paymasterContractAddress:
          process.env.PAYMASTER_SANDBOX_CONTRACT_ADDRESS_V_0_1_0,
        url: process.env.SPARK_RPC_URL || 'https://rpc.fusespark.io'
      }
    }
  }
})
