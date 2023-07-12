export default () => ({
  BundlerApiController: {
    productionUrl: process.env.BUNDLER_API_PRD_URL,
    sandboxUrl: process.env.BUNDLER_API_SANDBOX_URL
  }
})
