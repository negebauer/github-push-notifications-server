const queue = require('../queue')
const { QUEUE_JOB_PRIORITY } = require('../constants')

const createJob = async (type, data, options = {}) => {
  const { priority, removeOnComplete, delay } = options
  return new Promise((res, rej) => {
    const job = queue
      .create(type, data)
      .delay(delay || 1000 * 60)
      .priority(priority || QUEUE_JOB_PRIORITY.normal)
      .attempts(1)
      .removeOnComplete(removeOnComplete !== undefined ? removeOnComplete : true)
      .save(err => {
        if (err) return rej(err)
        return res(job)
      })
  })
}

module.exports = { createJob }
