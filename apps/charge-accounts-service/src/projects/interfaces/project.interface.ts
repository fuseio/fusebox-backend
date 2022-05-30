import { Document } from 'mongoose';

export interface Project extends Document {
  readonly ownerId: string;
  readonly name: string;
  readonly description: string;
}
