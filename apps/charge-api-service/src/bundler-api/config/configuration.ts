export default () => ({
  bundler: {
    etherspot: {
      production: {
        url: process.env.BUNDLER_API_PRD_URL
      },
      sandbox: {
        url: process.env.BUNDLER_API_SANDBOX_URL
      }
    },
    pimlico: {
      production: {
        url: process.env.PIMLICO_API_PRD_URL
      },
      sandbox: {
        url: process.env.PIMLICO_API_SANDBOX_URL
      }
    }
  }
})
