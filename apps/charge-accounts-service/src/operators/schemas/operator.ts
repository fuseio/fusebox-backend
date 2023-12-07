import * as mongoose from 'mongoose'

export const OperatorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    emailAddress: { type: String, required: true },
    externallyOwnedAccountAddress: { type: String, required: true },
    smartContractAccountAddress: { type: String, required: true, unique: true, index: true },
  },
  {
    timestamps: true
  }
)
