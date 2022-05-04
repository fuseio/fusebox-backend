import * as mongoose from 'mongoose';

export const ProjectSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        logoUri: { type: String },
    },
    {
        timestamps: true
    }
);