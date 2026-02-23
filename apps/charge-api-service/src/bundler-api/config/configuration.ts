export default () => ({
  bundler: {
    production: {
      url: process.env.PIMLICO_API_PRD_URL
    },
    sandbox: {
      url: process.env.PIMLICO_API_SANDBOX_URL
    }
  }
})
