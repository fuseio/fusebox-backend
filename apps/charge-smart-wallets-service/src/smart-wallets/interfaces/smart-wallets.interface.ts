import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { Document } from 'mongoose'

export interface SmartWallet extends Document {
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
  readonly versionType: string;
}

export interface SmartWalletService {
  auth: (smartWalletsAuthDto: SmartWalletsAuthDto) => Promise<Record<string, string>>;
}
