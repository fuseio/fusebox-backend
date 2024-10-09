import * as mongoose from 'mongoose'

export const OperatorRefreshTokenSchema = new mongoose.Schema(
  {
    auth0Id: { type: String, required: true, index: true },
    refreshToken: { type: String, required: true, unique: true, index: true },
    usedAt: { type: Date, default: null },
    invalidAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
)
