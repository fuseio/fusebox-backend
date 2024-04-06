export default () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB) || 0
  },
  retryTimeIntervalsMS: {
    1: 15000, // 15 sec
    2: 60000, // 1 min
    3: 600000, // 10 min
    4: 3600000, // 1 hour
    5: 86400000, // 1 day
    6: 86400000 // 1 day
  }
})
