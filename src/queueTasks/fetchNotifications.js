const axios = require('axios')
const { QUEUE_JOBS: { FETCH_NOTIFICATIONS } } = require('../constants')
const User = require('../models/user')
const { getJob } = require('../helpers/queue')
const { createJob } = require('./index')

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
    job.inactive()
  } catch (err) {
    if (err.message !== `job "${jobId}" doesnt exist`) {
      return console.error('[ERR] checkFetchNotifications', err);
    }
    createFetchNotifications(user)
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
  // Retrieve data
  const { username, lastModified: ifModifiedSince } = job.data
  const user = await User.findOne({ username })

  // Call github notifications api and reschedule next fetch
  const notificationsUrl = `https://api.github.com/notifications?access_token=${user.token}`
  let response
  try {
    response = await axios(notificationsUrl, { headers: { 'If-Modified-Since': ifModifiedSince || '' } })
  } catch (err) {
    if (err.response.status == 304) {
      rescheduleFetchNotifications(user, err.response.headers)
      return done()
    }
    rescheduleFetchNotifications(user, { 'last-modified': ifModifiedSince })
    return done(err)
  }
  rescheduleFetchNotifications(user, response.headers)

  // Parse and send push notifications
  const { data: notifications } = response
  notifications.forEach(notification => {
    const {
      repository: { name, full_name: fullName },
      subject: { title, url, latest_comment_url, type },
      reason,
      url: notificationThreadUrl,
    } = notification
    console.log('notification', { name, title, type, reason });
    // console.log('notification', { name, fullName, title, url, latest_comment_url, type, reason, notificationThreadUrl });
  })
  console.log('[JOB] Notifications', notifications.length)
  done()
}

async function createMissingFetchNotificationsJobs() {
  // TODO: Create a job for each user that doesn't have one
}

module.exports = {
  checkFetchNotifications,
  processFetchNotifications,
  createMissingFetchNotificationsJobs
}
