const kue = require('kue')
const raven = require('raven')
const queue = require('./')
const { getJob } = require('../helpers/queue')
const { DEACTIVATE_FETCH_NOTIFICATIONS } = require('../env')

const {
  QUEUE_JOBS: {
    FETCH_NOTIFICATIONS,
  },
} = require('../constants')
const {
  processFetchNotifications,
  createMissingFetchNotificationsJobs,
  recreateFetchNotifications,
} = require('./jobs/fetchNotifications')

const CONCURRENCY = {
  [FETCH_NOTIFICATIONS]: 10
}

// Assign each queue type to it's processer
queue.process(FETCH_NOTIFICATIONS, CONCURRENCY[FETCH_NOTIFICATIONS], processFetchNotifications)

const maxListeners = Object.values(CONCURRENCY).reduce((i, t) => i + t)
queue.setMaxListeners(maxListeners + 1)

function forceStart(err, ids) {
  return Promise.all(ids.map(async id => {
    const job = await getJob(id)
    job.inactive()
    // if(job.type === FETCH_NOTIFICATIONS) {
    //   recreateFetchNotifications(job.data)
    //   job.remove()
    // }
  })).catch(err => raven.captureException(err))
}

async function startupMaintenance() {
  await Promise.all([
    new Promise(res => queue.inactive((err,ids) => res(forceStart(err, ids)))),
    new Promise(res => queue.active((err,ids) => res(forceStart(err, ids)))),
  ])
  if (!DEACTIVATE_FETCH_NOTIFICATIONS) await createMissingFetchNotificationsJobs()
}

startupMaintenance()
