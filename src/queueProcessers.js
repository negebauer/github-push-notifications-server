const kue = require('kue')
const queue = require('./queue')
const { getJob } = require('./helpers/queue')
const { DEACTIVATE_FETCH_NOTIFICATIONS } = require('./constants')

const {
  QUEUE_JOBS: {
    FETCH_NOTIFICATIONS,
  },
} = require('./constants')
const { processFetchNotifications, createMissingFetchNotificationsJobs } = require('./queueTasks/fetchNotifications')

const CONCURRENCY = {
  FETCH_NOTIFICATIONS: 10
}

// Assign each queue type to it's processer
queue.process(FETCH_NOTIFICATIONS, CONCURRENCY[FETCH_NOTIFICATIONS], processFetchNotifications)

queue.setMaxListeners(Object.values(CONCURRENCY).reduce((i, t) => i + t))

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
  if (!DEACTIVATE_FETCH_NOTIFICATIONS) await createMissingFetchNotificationsJobs()
}

startupMaintenance()
