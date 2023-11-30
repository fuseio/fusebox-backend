export interface WalletActionInterface {
    walletAddress: string;
    name: string;
    status: string;
    received: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
        type: string;
        value?: string;
        to?: string;
        from?: string;
        tokenId?: string;
    }[];
    sent: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
        type: string;
        value?: string;
        to?: string;
        from?: string;
        tokenId?: string;
    }[];
    userOpHash?: string;
    txHash?: string;
    blockNumber?: number;
    value?: number;
    description?: string;
}
