export interface ISmartWalletUser {
  readonly ownerAddress: string;
  readonly projectId: string;
  query?: Record<string, any>;
  smartWalletAddress?: string;
}
