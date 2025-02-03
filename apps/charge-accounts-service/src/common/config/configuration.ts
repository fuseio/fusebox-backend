export default () => ({
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  googleOperatorFormUrl: process.env.GOOGLE_OPERATOR_FORM_URL,
  paymaster: {
    '0_1_0': {
      production: {
        paymasterContractAddress:
          process.env.PAYMASTER_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0,
        entrypointAddress: process.env.ENTRYPOINT_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0,
        url: process.env.RPC_URL || 'https://rpc.fuse.io',
        etherspotWalletFactoryContractAddress:
          process.env.ETHERSPOT_WALLET_FACTORY_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0,
        usdcContractAddress: process.env.USDC_CONTRACT_ADDRESS_MAINNET

      },
      sandbox: {
        paymasterContractAddress:
          process.env.PAYMASTER_SANDBOX_CONTRACT_ADDRESS_V_0_1_0,
        entrypointAddress: process.env.ENTRYPOINT_SANDBOX_CONTRACT_ADDRESS_V_0_1_0,
        url: process.env.SPARK_RPC_URL || 'https://rpc.fusespark.io',
        etherspotWalletFactoryContractAddress:
          process.env.ETHERSPOT_WALLET_FACTORY_SANDBOX_CONTRACT_ADDRESS_V_0_1_0,
        usdcContractAddress: process.env.USDC_CONTRACT_ADDRESS_TESTNET
      }
    }
  }

})
