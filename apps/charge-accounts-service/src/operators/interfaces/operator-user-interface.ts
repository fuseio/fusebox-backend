export interface OperatorUser {
  id: string;
  name: string;
  email: string;
  auth0Id: string;
  smartWalletAddress: string;
  isActivated: boolean;
  createdAt: Date;
  etherspotSmartWalletAddress?: string;
}
