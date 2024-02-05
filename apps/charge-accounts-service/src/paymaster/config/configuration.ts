export default () => ({
  CHARGE_BASE_URL: process.env.CHARGE_BASE_URL,
  paymaster: {
    '0_1_0': {
      production: {
        paymasterContractAddress:
          process.env.PAYMASTER_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0,
        entrypointAddress: process.env.ENTRYPOINT_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0,
        url: process.env.RPC_URL || 'https://rpc.fuse.io',
        etherspotWalletFactoryContractAddress:
          process.env.ETHERSPOT_WALLET_FACTORY_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0
      },
      sandbox: {
        paymasterContractAddress:
          process.env.PAYMASTER_SANDBOX_CONTRACT_ADDRESS_V_0_1_0,
        entrypointAddress: process.env.ENTRYPOINT_SANDBOX_CONTRACT_ADDRESS_V_0_1_0,
        url: process.env.SPARK_RPC_URL || 'https://rpc.fusespark.io',
        etherspotWalletFactoryContractAddress:
          process.env.ETHERSPOT_WALLET_FACTORY_SANDBOX_CONTRACT_ADDRESS_V_0_1_0
      }
    }
  }

})
