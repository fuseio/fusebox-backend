import { Document } from 'mongoose'

export interface PaymasterInfo extends Document {
    readonly projectId: string;
    readonly paymasterAddress: string;
    readonly sponsorId: string;
}
