import { Document } from 'mongoose';

export interface User extends Document {
  readonly name: string;
  readonly email: string;
  readonly auth0Id: string;
  readonly questionnaire: object;
}
