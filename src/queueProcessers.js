const kue = require('kue')
const queue = require('./queue')
const { getJob } = require('./helpers/queue')

const {
  QUEUE_JOBS: {
    FETCH_NOTIFICATIONS,
  },
} = require('./constants')
const { processFetchNotifications, createMissingFetchNotificationsJobs } = require('./queueTasks/fetchNotifications')

// Assign each queue type to it's processer
queue.process(FETCH_NOTIFICATIONS, 10, processFetchNotifications)

function forceStart(err, ids) {
  return Promise.all(ids.map(async id => {
    const job = await getJob(id)
    job.inactive()
  })).catch(() => {})
}

async function startupMaintenance() {
  await Promise.all([
    new Promise(res => queue.inactive((err,ids) => res(forceStart(err, ids)))),
    new Promise(res => queue.active((err,ids) => res(forceStart(err, ids)))),
  ])
  await createMissingFetchNotificationsJobs()
}

startupMaintenance()
