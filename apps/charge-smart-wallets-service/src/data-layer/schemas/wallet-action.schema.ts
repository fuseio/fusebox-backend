import * as mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const tokenSchema = new mongoose.Schema({
  name: String,
  symbol: String,
  address: String,
  decimals: Number,
  value: String,
  from: String,
  to: String,
  logIndex: String
})

export const WalletActionSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, required: true, default: false },
    received: [tokenSchema],
    sent: [tokenSchema],
    userOpHash: { type: String },
    txHash: { type: String },
    blockNumber: { type: Number },
    timestamp: { type: Number },
    value: { type: Number }
  }
  ,
  {
    timestamps: true
  }

)
WalletActionSchema.index({ walletAddress: 1 })
WalletActionSchema.index({ tokenAddress: 1 })
WalletActionSchema.plugin(paginate)

export interface WalletActionDocument extends mongoose.Document { }
