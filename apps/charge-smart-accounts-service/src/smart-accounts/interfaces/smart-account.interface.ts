import { Document } from 'mongoose'

export interface SmartAccount extends Document {
  readonly projectId: string;
  readonly ownerAddress: string;
  readonly smartAccountAddress: string;
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
