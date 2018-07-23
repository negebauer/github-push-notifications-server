const keyMirror = require('keymirror')

const {
  DEACTIVATE_FETCH_NOTIFICATIONS,
} = process.env

module.exports = {

  DEACTIVATE_FETCH_NOTIFICATIONS,

  PRODUCTION: process.env.NODE_ENV === 'production',
  DEVELOPMENT: process.env.NODE_ENV !== 'production',

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
