import * as mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const ercTransferMetadata = {
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  address: { type: String, required: true },
  decimals: { type: Number, default: 0 },
  type: { type: String, required: true },
  value: { type: String, nullable: true },
  to: { type: String, nullable: true },
  from: { type: String, nullable: true },
  tokenId: { type: String, nullable: true }
}

export const WalletActionSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, required: true, default: false },
    received: [ercTransferMetadata],
    sent: [ercTransferMetadata],
    userOpHash: { type: String },
    txHash: { type: String },
    blockNumber: { type: Number },
    value: { type: Number },
    description: { type: String }
  },
  {
    timestamps: true
  }
)

WalletActionSchema.index({ walletAddress: 1 })
WalletActionSchema.index({ userOpHash: 1 })
WalletActionSchema.plugin(paginate)

export interface WalletActionDocument extends mongoose.Document { }
