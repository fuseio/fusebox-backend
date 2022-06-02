import * as mongoose from 'mongoose'
const { ObjectId, String } = mongoose.Schema.Types

export const RelayAccountSchema = new mongoose.Schema(
  {
    projectId: {
      type: ObjectId,
      ref: 'Project',
      required: true
    },
    encryptedPK: {
      type: String,
      required: true
    },
    publicKey: {
      type: String,
      required: true
    },
    nonce: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)
