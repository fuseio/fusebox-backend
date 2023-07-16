import * as mongoose from 'mongoose'



export const PaymasterInfoSchema = new mongoose.Schema({
    paymasterAddress: { type: String, required: true },
    paymasterVersion: { type: String, required: true },
    entrypointAddress: { type: String, required: true },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    sponsorId: { type: String, required: true, unique: true },
    isActive: { type: Boolean, required: true }
},
    {
        timestamps: true
    }
);
