import { Document } from 'mongoose'

export interface Operator extends Document {
  readonly firstName: string;
  readonly lastName: string;
  readonly emailAddress: string;
  readonly externallyOwnedAccountAddress: string;
  readonly smartContractAccountAddress: string;
}
