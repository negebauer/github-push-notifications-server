const axios = require('axios').create({ timeout: 5000 })
const raven = require('raven')
const { QUEUE_JOBS: { FETCH_NOTIFICATIONS } } = require('../../constants')
const User = require('../../models/user')
const { jobDoesntExistMsg } = require('../../helpers/jobs')
const { getJob } = require('../../helpers/queue')
const { newNotifications } = require('../../notifications')
const createJob = require('../createJob')

/**
 *  Called when a user performs a login. Decides
 *  if it should create a fetchNotifications task.
 *  @author @negebauer
 */
async function checkFetchNotifications(user) {
  const { jobId } = user
  if (!jobId) return createFetchNotifications(user)
  try {
    const job = await getJob(jobId)
    if (job._state !== 'delayed') job.inactive()
  } catch (err) {
    if (err.message === jobDoesntExistMsg(jobId)) {
      return createFetchNotifications(user)
    }
    raven.captureException(err)
    return console.error('[ERR] checkFetchNotifications', err);
  }
}

/**
 *  Creates a new fetchNotifications job
 *  if the user doesn't have one already
 *  @author @negebauer
 *  @param  {Object}  [params={}] Extra params { delay, lastModified }
 */
async function createFetchNotifications(user, params = {}) {
  const { username } = user
  const { delay = 1000 * 60, lastModified } = params
  const job = await createJob(
    FETCH_NOTIFICATIONS,
    { username, lastModified, title: username },
    { delay },
  )
  await user.update({ jobId: job.id })
  return job
}

async function recreateFetchNotifications({ username, lastModified, delay }) {
  const user = await User.findOne({ username })
  createFetchNotifications(user, { lastModified, delay })
}

function rescheduleFetchNotifications(user, responseHeaders) {
  const {
    'x-poll-interval': delaySeconds,
    'last-modified': lastModified,
  } = responseHeaders
  const delay = delaySeconds * 1000
  createFetchNotifications(user, { delay, lastModified })
}

/**
 *  Calls the github api to retrieve notifications
 *  @author @negebauer
 */
async function processFetchNotifications(job, done) {
  job.log('processFetchNotifications')
  // Retrieve data
  const { username, lastModified: ifModifiedSince } = job.data
  job.log('retrieved user data')
  const user = await User.findOne({ username })
  job.log('retrieved user')
  if (user.jobId > job.id) {
    job.log('user.jobId > job.id')
    return done()
  }

  // Call github notifications api and reschedule next fetch
  const notificationsUrl = `https://api.github.com/notifications?access_token=${user.token}`
  let response
  try {
    response = await axios(notificationsUrl, { headers: { 'If-Modified-Since': ifModifiedSince || '' } })
    job.log('called github api')
  } catch (err) {
    job.log('failed github api')
    const response = err.response || {}
    const headers = { 'last-modified': ifModifiedSince, ...response.headers = {} }
    job.log('headers', headers)
    job.log('error:', err)
    if (response.status == 304) {
      rescheduleFetchNotifications(user, headers)
      return done()
    } else if (err.code === 'ECONNABORTED') {
      rescheduleFetchNotifications(user, headers)
      return done(err)
    }
    rescheduleFetchNotifications(user, headers)
    raven.captureException(err)
    return done(err)
  }
  rescheduleFetchNotifications(user, response.headers)
  job.log('rescheduleFetchNotifications')

  // Parse and send push notifications
  const { data: notifications } = response
  newNotifications(user._id, notifications)
  job.log('sentNotifications')
  // console.log('[JOB] Notifications', notifications.length)
  done()
}

async function createMissingFetchNotificationsJobs() {
  const users = await User.find()
  return Promise.all(users.map(async user => {
    const { jobId, token } = user
    if (!jobId && !token) return
    else if (!jobId && token) return createFetchNotifications(user)
    else {
      try {
        await getJob(jobId)
      } catch (err) {
        if (err.message === jobDoesntExistMsg(jobId)) return createFetchNotifications(user)
        raven.captureException(err)
      }
    }
  }))
}

module.exports = {
  checkFetchNotifications,
  recreateFetchNotifications,
  processFetchNotifications,
  createMissingFetchNotificationsJobs
}
