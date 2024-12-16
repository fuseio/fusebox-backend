export default () => ({
  bundler: {
    production:
    {
      v0: {
        url: process.env.BUNDLER_API_PRD_URL_V0
      },
      v0_7: {
        url: process.env.BUNDLER_API_PRD_URL_V0_7
      }
    },
    sandbox: {
      v0: {
        url: process.env.BUNDLER_API_SANDBOX_URL_V0
      }
    }
  }
})
