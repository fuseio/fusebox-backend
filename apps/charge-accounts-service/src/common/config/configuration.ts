export default () => ({
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  hubspotPortalId: process.env.HUBSPOT_PORTAL_ID,
  hubspotOperatorCreationFormId: process.env.HUBSPOT_OPERATOR_CREATION_FORM_ID,
  hubspotPrivateAppAccessKey: process.env.HUBSPOT_PRIVATE_APP_ACCESS_KEY,
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
