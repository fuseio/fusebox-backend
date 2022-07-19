export default () => ({
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    db: parseInt(process.env.REDIS_DB),
    password: process.env.REDIS_PASSWORD,
    onClientReady: (client) => {
      client.on('error', (err) => {
        console.log('Redis connection error ' + err)
      }
      )
    }
  }
})
