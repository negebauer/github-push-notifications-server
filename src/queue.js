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

const queue = kue.createQueue(redisConfig)
queue.watchStuckJobs(1000 * 10)
queue.on('ready', () => console.log('[REDIS] Queue ready'))
queue.on('job enqueue', (id, type) => console.log('[KUE] Job queued', id, type))
queue.on('job complete', (id, result) => console.log('[KUE] Job completed', id))
queue.on('error', err => console.log('[REDIS] Connection error:', err))

function queueShutdown() {
  return new Promise((res, rej) => queue.shutdown(2000, err => res(console.log('[KUE] Shutdown'))))
}

module.exports = queue
