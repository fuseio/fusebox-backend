import * as mongoose from 'mongoose'
const { String } = mongoose.Schema.Types

export const SmartWalletSchema = new mongoose.Schema(
  {
    ownerAddress: { type: String, required: true, index: true, unique: true },
    smartWalletAddress: { type: String, required: true, index: true },
    isContractDeployed: { type: Boolean, default: false },
    walletOwnerOriginalAddress: { type: String, immutable: true }, // So we can know the first owner in case owner transfer ownership.
    walletFactoryOriginalAddress: { type: String, immutable: true },
    walletFactoryCurrentAddress: { type: String, immutable: true },
    walletImplementationOriginalAddress: { type: String, immutable: true },
    walletImplementationCurrentAddress: { type: String, immutable: true },
    walletModulesOriginal: { type: Object },
    walletModules: { type: Object },
    salt: { type: String, default: null, immutable: true },
    networks: [{ type: String }],
    // TODO: move the upgrade API from legacy APIs
    // upgradesInstalled: { type: Array, of: { type: ObjectId, ref: 'WalletUpgrade' }, default: [] },
    // TODO: default values of version & paddedVersion should come from config
    version: { type: String, default: '1.7.0' },
    paddedVersion: { type: String, default: '0001.0007.0000' }
  },
  {
    timestamps: true
  }
)
