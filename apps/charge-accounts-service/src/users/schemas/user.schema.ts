import * as mongoose from 'mongoose'

export const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    auth0Id: { type: String, required: true, unique: true, index: true },
    questionnaire: { type: Object }
  },
  {
    timestamps: true
  }
)
