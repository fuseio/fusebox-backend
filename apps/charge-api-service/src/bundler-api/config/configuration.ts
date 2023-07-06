export default () => ({
  BundlerApiController: {
    productionUrl: process.env.BUNDLER_API_PRD_URL || 'http://skandha:14337/122/',
    sandboxUrl: process.env.BUNDLER_API_SANDBOX_URL || 'http://skandha:14337/122/'
  }
})
