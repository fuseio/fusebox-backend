import { Document } from 'mongoose'

export interface PaymasterInfo extends Document {
    readonly paymasterAddress: string;
    readonly paymasterVersion: string;
    readonly entrypointAddress: string;
    readonly projectId: string;
    readonly sponsorId: string;
    readonly isActive: boolean;
}
