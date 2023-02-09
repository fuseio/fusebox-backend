export default () => ({
  rpcConfig: {
    rpc: {
      url: process.env.RPC_URL || 'https://rpc.fuse.io'
    }
  },
  sharedAddresses: {
    WalletFactory: '0x2ab4A64e246010e96C5387Ec4C7B1256B9783ce3',
    WalletImplementation: '0x7109623c967D70c48c835ed2e4E3CdFd27fa8003',
    MultiSigWallet: '0xc591e1194056166812049743DaAa714159e6c3C8',
    walletModules: {
      GuardianManager: '0xC1254443B6b9E5b5714D57ae3Af16FE9D220775D',
      LockManager: '0x370672167439e399cE753963E31E26EEB5bfaf6c',
      RecoveryManager: '0xA85aA96857cBdEb5C7e88a59772E6E7170986f02',
      ApprovedTransfer: '0x959f0fF280EAF7BB1b57ec75AC777aB863f82736',
      TransferManager: '0xF66e26Fd99F4687CC29148BE2e331df2e49E249E',
      NftTransfer: '0xe713Ec7D3516d65966c5DeA3CF78EFE1DcaDd47B',
      TokenExchanger: '0xd636460D8866430EbDeDb5A3AE4f19D0735fD1B7',
      CommunityManager: '0x9585db67ab966Ec8dfDdc47bAD9cE46905A5a0e1',
      WalletOwnershipManager: '0xfE0B31C96FE5929849D8D48C56c428d935dDfE00'
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
