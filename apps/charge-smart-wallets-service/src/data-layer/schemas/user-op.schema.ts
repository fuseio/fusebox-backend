import * as mongoose from 'mongoose'

export const UserOpSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true }, // Address is a string of hexadecimal characters
    apiKey: { type: String, required: true, index: true }, // Api key of project
    nonce: { type: String, required: true }, // Nonce is a string representation of a number that increases with each operation
    initCode: { type: String, required: true }, // InitCode is a buffer of bytes that contains the code to create new wallets
    callData: { type: String, required: true }, // CallData is a buffer of bytes that contains the data to execute the action
    callGasLimit: { type: String, required: true }, // CallGasLimit is a number that specifies the maximum gas to use for the action
    verificationGasLimit: { type: String, required: true }, // VerificationGasLimit is a number that specifies the maximum gas to use for verifying the operation
    preVerificationGas: { type: String, required: true }, // PreVerificationGas is a number that specifies the gas to use before verifying the operation
    maxFeePerGas: { type: String, required: true }, // MaxFeePerGas is a number that specifies the maximum fee per gas unit for the operation
    maxPriorityFeePerGas: { type: String, required: true }, // MaxPriorityFeePerGas is a number that specifies the maximum priority fee per gas unit for the operation
    paymasterAndData: { type: String, required: false }, // PaymasterAndData is a buffer of bytes that contains the address and data of the paymaster who pays for the operation
    signature: { type: String, required: true }, // Signature is a buffer of bytes that contains the signature of the sender
    userOpHash: { type: String, required: true, default: '0x', index: true },
    txHash: { type: String, required: false, default: '0x' },
    blockNumber: { type: String, required: false, default: '' },
    walletFunction: { type: Object, required: false, default: {} },
    targetFunctions: { type: Array, of: Object, required: false },
    paymaster: { type: String, required: true, default: '0x' },
    sponsorId: { type: String, required: true, default: '0', index: true },
    success: { type: Boolean, required: true, default: false },
    actualGasCost: { type: String, required: true, default: 0 },
    actualGasUsed: { type: String, required: true, default: 0 }
  },
  {
    timestamps: true
  }
)
