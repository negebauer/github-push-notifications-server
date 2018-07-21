const kue = require('kue')
const queue = require('./queue')

const {
  QUEUE_JOBS: {
    FETCH_NOTIFICATIONS,
  },
} = require('./constants')
const { processFetchNotifications, createMissingFetchNotificationsJobs } = require('./queueTasks/fetchNotifications')

// Assign each queue type to it's processer
queue.process(FETCH_NOTIFICATIONS, 10, processFetchNotifications)

// Make sure to have required jobs in queue
createMissingFetchNotificationsJobs()

function forceStart(err, ids) {
  ids.forEach(id => {
    kue.Job.get(id, (err, job) => {
      job.inactive();
    })
  })
}

queue.active(forceStart)
queue.inactive(forceStart)
