export default () => ({
  bundler: {
    production: {
      v06: {
        url: process.env.BUNDLER_API_PRD_URL_V06
      },
      v07: {
        url: process.env.BUNDLER_API_PRD_URL_V07
      }
    },
    sandbox: {
      v06: {
        url: process.env.BUNDLER_API_SANDBOX_URL_V06
      },
      v07: {
        url: process.env.BUNDLER_API_SANDBOX_URL_V07
      }
    }
  }
})
