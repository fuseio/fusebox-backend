import { Document } from 'mongoose'

export interface OperatorRefreshToken extends Document {
  readonly auth0Id: string;
  readonly refreshToken: string;
  readonly usedAt: Date;
  readonly invalidAt: Date;
}
