import * as mongoose from 'mongoose'

const PaymasterInfoSchema = new mongoose.Schema({
  paymasterAddress: { type: String, required: true },
  sponsorId: { type: Number, required: true },
});

export const ProjectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    paymasterInfo: { type: Object, required: false }
  },
  {
    timestamps: true
  }
)
