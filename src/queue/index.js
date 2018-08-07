const kue = require('kue')
const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD } = require('../env')

const redisConfig = {
  redis: {
    port: REDIS_PORT,
    host: REDIS_HOST,
    auth: REDIS_PASSWORD,
    options: {
      no_ready_check: false,
    },
  },
}

const queue = kue.createQueue(redisConfig)
queue.watchStuckJobs(1000 * 10)
queue.on('error', err => console.log('[REDIS] Connection error:', err))

function queueShutdown() {
  return new Promise((res, rej) => queue.shutdown(2000, err => res(console.log('[KUE] Shutdown'))))
}

module.exports = queue
