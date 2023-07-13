export default () => ({
  production: {
    url: process.env.BUNDLER_API_PRD_URL
  },
  sandbox: {
    url: process.env.BUNDLER_API_SANDBOX_URL
  }
})
