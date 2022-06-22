export default () => ({
  LegacyAdminApiController: {
    baseUrl: `${process.env.LEGACY_FUSE_ADMIN_API_URL}/api/v2/admin`,
    replaceHeaders: true
  },
  LegacyJobsApiController: {
    baseUrl: `${process.env.LEGACY_FUSE_ADMIN_API_URL}/api/v2/jobs`,
    replaceHeaders: true
  },
  LegacyWalletApiController: {
    baseUrl: `${process.env.LEGACY_FUSE_WALLET_API_URL}/api/v1`,
    replaceHeaders: false,
    addCommunityAddressForPostRequests: true
  },
  LegacyTradeApiController: {
    baseUrl: `${process.env.LEGACY_FUSE_TRADE_API_URL}/api/v1`,
    replaceHeaders: false
  }
})
