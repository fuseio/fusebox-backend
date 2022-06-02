import * as mongoose from 'mongoose';
const { ObjectId, String } = mongoose.Schema.Types;

export const RelayAccountSchema = new mongoose.Schema(
  {
    projectId: {
      type: ObjectId,
      ref: 'Project',
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    childIndex: {
      type: Number,
      required: [true, "can't be blank"],
    },
    nonce: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
