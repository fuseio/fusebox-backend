import { Document } from 'mongoose'

export interface OperatorRefreshToken extends Document {
  readonly auth0Id: string;
  readonly refreshToken: string;
  readonly used_at: Date;
  readonly invalid_at: Date;
}
