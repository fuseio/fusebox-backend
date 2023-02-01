import { Document } from 'mongoose'

export interface SmartWallet extends Document {
  readonly projectId: string;
  readonly ownerAddress: string;
  readonly smartWalletAddress: string;
  readonly isContractDeployed: string;
  readonly walletOwnerOriginalAddress: string;
  readonly walletFactoryOriginalAddress: string;
  readonly walletFactoryCurrentAddress: string;
  readonly walletImplementationOriginalAddress: string;
  readonly walletImplementationCurrentAddress: string;
  readonly walletModulesOriginal: object;
  readonly walletModules: object;
  readonly salt: string;
  readonly networks: string[];
  // TODO:
  // readonly upgradesInstalled: any[];
  readonly version: string;
  readonly paddedVersion: string;
}
