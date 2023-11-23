export default () => ({
  ExplorerApiController: {
    baseUrl: process.env.EXPLORER_API_URL || 'https://explorer.fuse.io/api',
    apiKey: process.env.EXPLORER_API_KEY || ''
  }
})
