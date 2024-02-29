export default () => ({
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  fuseSdkApiKey: process.env.FUSE_SDK_API_KEY,
  fuseSdkPrivateKey: process.env.FUSE_SDK_PRIVATE_KEY,
  webhookId: process.env.INCOMING_TOKEN_TRANSFERS_WEBHOOK_ID,
  chargeBaseURL: process.env.CHARGE_BASE_URL,
  tradeApiBaseUrl: process.env.LEGACY_FUSE_TRADE_API_URL,
  sharedAddresses: {
    WalletFactory: process.env.WALLET_FACTORY,
    WalletImplementation: process.env.WALLET_IMPLEMENTATION,
    MultiSigWallet: process.env.MULTI_SIG_WALLET,
    walletModules: {
      GuardianManager: process.env.GUARDIAN_MANAGER,
      LockManager: process.env.LOCK_MANAGER,
      RecoveryManager: process.env.RECOVERY_MANAGER,
      ApprovedTransfer: process.env.APPROVED_TRANSFER,
      TransferManager: process.env.TRANSFER_MANAGER,
      NftTransfer: process.env.NFT_TRANSFER,
      TokenExchanger: process.env.TOKEN_EXCHANGER,
      CommunityManager: process.env.COMMUNITY_MANAGER,
      WalletOwnershipManager: process.env.WALLET_OWNERSHIP_MANAGER
    }
  },
  version: '1.7.0',
  paddedVersion: '0001.0007.0000',
  relayApi: `${process.env.LEGACY_FUSE_WALLET_API_URL}/api/v3`,
  fuseWalletBackendJwt: process.env.FUSE_WALLET_BACKEND_JWT,
  centrifugoBaseUrl: process.env.CENTRIFUGO_API_URL,
  centrifugoApiKey: process.env.CENTRIFUGO_API_KEY,
  wsUrl: process.env.CENTRIFUGO_URI
})
