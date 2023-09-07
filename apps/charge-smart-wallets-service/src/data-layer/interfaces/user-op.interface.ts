import { Document } from 'mongoose'


export interface BaseUserOp {
  sender: string; // Address is a string of hexadecimal characters
  nonce: number; // Nonce is a number that increases with each operation
  initCode: string; // InitCode is a buffer of bytes that contains the code to create new wallets
  callData: string; // CallData is a buffer of bytes that contains the data to execute the action
  callGasLimit: number; // CallGasLimit is a number that specifies the maximum gas to use for the action
  verificationGasLimit: number; // VerificationGasLimit is a number that specifies the maximum gas to use for verifying the operation
  preVerificationGas: number; // PreVerificationGas is a number that specifies the gas to use before verifying the operation
  maxFeePerGas: number; // MaxFeePerGas is a number that specifies the maximum fee per gas unit for the operation
  maxPriorityFeePerGas: number; // MaxPriorityFeePerGas is a number that specifies the maximum priority fee per gas unit for the operation
  paymasterAndData?: string; // PaymasterAndData is a buffer of bytes that contains the address and data of the paymaster who pays for the operation
  signature: string; // Signature is a buffer of bytes that contains the signature of the sender
}

export interface UserOp extends BaseUserOp, Document {
  userOpHash: string; // UserOpHash is a string of hexadecimal characters
  walletFunction: object;
  targetFunction: object;
  paymaster: string; // Paymaster is an address of hexadecimal characters
  success: boolean; // Success is a boolean value that indicates whether the operation was successful or not
  actualGasCost: number; // ActualGasCost is a number that indicates how much gas was spent for the operation
  actualGasUsed: number; // ActualGasUsed is a number that indicates how much gas was used for the operation
}
