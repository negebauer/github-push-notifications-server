const keyMirror = require('keymirror')

module.exports = {

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
  
}
