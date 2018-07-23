const keyMirror = require('keymirror')

const {
  NODE_ENV,
  DEACTIVATE_FETCH_NOTIFICATIONS,
  IOS_NOTIFICATIONS_PEM_DEVELOPMENT,
  IOS_NOTIFICATIONS_PEM_PRODUCTION,
} = process.env

const ENV = NODE_ENV || 'development'

module.exports = {

  DEACTIVATE_FETCH_NOTIFICATIONS,
  IOS_NOTIFICATIONS_PEM_DEVELOPMENT,
  IOS_NOTIFICATIONS_PEM_PRODUCTION,

  ENV,
  PRODUCTION: ENV === 'production',
  DEVELOPMENT: ENV === 'development',

  QUEUE_JOB_PRIORITY: keyMirror({
    low: undefined,
    normal: undefined,
    medium:undefined,
    high: undefined,
    critical: undefined,
  }),

  QUEUE_JOBS: {
    FETCH_NOTIFICATIONS: 'fetchNotifications',
  },

  jobDoesntExistMsg: jobId => `job "${jobId}" doesnt exist`
}
