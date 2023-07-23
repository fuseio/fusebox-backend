export default () => ({
  paymaster: {
    '0_1_0': {
      production: {
        paymasterContractAddress:
          process.env.PAYMASTER_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0,
        entrypointAddress: process.env.ENTRYPOINT_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0
      },
      sandbox: {
        paymasterContractAddress:
          process.env.PAYMASTER_SANDBOX_CONTRACT_ADDRESS_V_0_1_0,
        entrypointAddress: process.env.ENTRYPOINT_SANDBOX_CONTRACT_ADDRESS_V_0_1_0
      }
    },
    '0_2_0': {
      production: {
        paymasterContractAddress:
          process.env.PAYMASTER_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0,
        entrypointAddress: process.env.ENTRYPOINT_PRODUCTION_CONTRACT_ADDRESS_V_0_1_0
      },
      sandbox: {
        paymasterContractAddress:
          process.env.PAYMASTER_SANDBOX_CONTRACT_ADDRESS_V_0_1_0,
        entrypointAddress: process.env.ENTRYPOINT_SANDBOX_CONTRACT_ADDRESS_V_0_1_0
      }
    }
  }
})
