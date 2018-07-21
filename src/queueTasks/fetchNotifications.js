const axios = require('axios')
const { QUEUE_JOBS: { FETCH_NOTIFICATIONS } } = require('../constants')
const User = require('../models/user')
const { createJob } = require('./index')

function createFirstFetchNotifications(username) {
  // TODO: How to make sure that there's only one job for each user?
  return createFetchNotifications(username)
}

/**
 *  Creates a new fetchNotifications job
 *  if the user doesn't have one already
 *  @author @negebauer
 *  @param  {[type]}  user        An instance of the user
 *  @param  {Object}  [params={}] Extra params like delay and lastModified
 */
async function createFetchNotifications(username, params = {}) {
  const { delay = 1000 * 60, lastModified } = params
  const job = await createJob(
    FETCH_NOTIFICATIONS,
    { username, lastModified, title: username },
    { delay },
  )
  return job
}

function rescheduleFetchNotifications(user, responseHeaders) {
  const {
    'x-poll-interval': delaySeconds,
    'last-modified': lastModified,
  } = responseHeaders
  const delay = delaySeconds * 1000
  createFetchNotifications(user.username, { delay, lastModified })
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
  createFirstFetchNotifications,
  createFetchNotifications,
  processFetchNotifications,
  createMissingFetchNotificationsJobs
}
