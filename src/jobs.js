const kue = require('kue')

const redisConfig = {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    auth: process.env.REDIS_PASSWORD,
    options: {
      no_ready_check: false,
    },
  },
}

function setupJobs() {
  const queue = kue.createQueue(redisConfig)
  queue.on('error', err => console.log('[REDIS] Connection error:', err));
  return { kue, queue }
}

module.exports = setupJobs
