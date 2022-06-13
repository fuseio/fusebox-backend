export default () => ({
  LegacyStudioApiController: {
    baseUrl: `${process.env.LEGACY_FUSE_STUDIO_API_URL}/api/v2/admin`,
    replaceHeaders: true
  },
  LegacyJobsApiController: {
    baseUrl: `${process.env.LEGACY_FUSE_STUDIO_API_URL}/api/v2/jobs`,
    replaceHeaders: true
  },
  LegacyWalletApiController: {
    baseUrl: `${process.env.LEGACY_FUSE_WALLET_API_URL}/api/v1`,
    replaceHeaders: false
  },
  LegacyFuseswapApiController: {
    baseUrl: `${process.env.LEGACY_FUSE_SWAP_API_URL}/api/v1`,
    replaceHeaders: false
  }
})
