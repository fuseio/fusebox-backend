import { Document } from 'mongoose'

export interface WalletAction extends Document {
    walletAddress: string;
    userOpHash: string;
    action: object;
    status: string;

}
