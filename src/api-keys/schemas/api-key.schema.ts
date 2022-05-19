import * as mongoose from 'mongoose';

export const ApiKeySchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    publicKey: { type: String, required: true, index: true },
    secretHash: { type: String },
    isTest: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  },
);
