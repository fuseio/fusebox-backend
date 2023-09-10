import { Document } from 'mongoose'

export interface WalletAction extends Document {
    walletAddress: string;
    name: string;
    status: string;
    received: Token[];
    sent: Token[];
    userOpHash: string;
    txHash: string;
    blockNumber: number;
    timestamp: number;
    value: number;
}
interface Token {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    value: string;
    from: string;
    to: string;
    logIndex: string;
}
