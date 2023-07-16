import * as mongoose from 'mongoose'

export const PaymasterInfoSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  paymasterAddress: { type: String, required: true },
  sponsorId: { type: String, required: true },
},
  {
    timestamps: true
  }
)
