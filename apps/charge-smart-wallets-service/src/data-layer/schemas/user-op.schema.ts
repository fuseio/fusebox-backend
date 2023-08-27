import * as mongoose from 'mongoose'

export const UserOpSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true }, // Address is a string of hexadecimal characters
    nonce: { type: Number, required: true }, // Nonce is a number that increases with each operation
    initCode: { type: String, required: true }, // InitCode is a buffer of bytes that contains the code to create new wallets
    callData: { type: Object, required: true }, // CallData is a buffer of bytes that contains the data to execute the action
    callGasLimit: { type: Number, required: true }, // CallGasLimit is a number that specifies the maximum gas to use for the action
    verificationGasLimit: { type: Number, required: true }, // VerificationGasLimit is a number that specifies the maximum gas to use for verifying the operation
    preVerificationGas: { type: Number, required: true }, // PreVerificationGas is a number that specifies the gas to use before verifying the operation
    maxFeePerGas: { type: Number, required: true }, // MaxFeePerGas is a number that specifies the maximum fee per gas unit for the operation
    maxPriorityFeePerGas: { type: Number, required: true }, // MaxPriorityFeePerGas is a number that specifies the maximum priority fee per gas unit for the operation
    paymasterAndData: { type: String, required: false }, // PaymasterAndData is a buffer of bytes that contains the address and data of the paymaster who pays for the operation
    signature: { type: String, required: true }, // Signature is a buffer of bytes that contains the signature of the sender
    userOpHash: { type: String, required: true, default: '0x' },
    paymaster: { type: String, required: true, default: '0x' },
    success: { type: Boolean, required: true, default: false },
    actualGasCost: { type: Number, required: true, default: 0 },
    actualGasUsed: { type: Number, required: true, default: 0 }
  }
  ,
  {
    timestamps: true
  }
)
