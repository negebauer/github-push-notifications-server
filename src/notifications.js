const apn = require('apn')
const gcm = require('node-gcm')
const keyMirror = require('keymirror')
const raven = require('raven')
const User = require('./models/user')
const {
  NODE_ENV,
  PRODUCTION,
  IOS_NOTIFICATIONS_PEM_DEVELOPMENT,
  IOS_NOTIFICATIONS_PEM_PRODUCTION,
  FCM_KEY,
} = require('./env')
const { messageForNotification, urlForNotification } = require('./helpers/githubNotification')

function loadApnCertificateFromEnv() {
  const rawCert = PRODUCTION
    ? IOS_NOTIFICATIONS_PEM_PRODUCTION
    : IOS_NOTIFICATIONS_PEM_DEVELOPMENT
  const certBuffer = Buffer.from(rawCert, 'base64')
  return certBuffer
}

const apnCertificate = IOS_NOTIFICATIONS_PEM_DEVELOPMENT && IOS_NOTIFICATIONS_PEM_PRODUCTION
  ? loadApnCertificateFromEnv()
  : `./certificates/${NODE_ENV}_com.negebauer.GithubPushNotificationsMobile.pem`

const optionsApn = {
  cert: apnCertificate,
  key: apnCertificate,
  production: PRODUCTION,
}

const providerApn = new apn.Provider(optionsApn)
const providerGcm = new gcm.Sender(FCM_KEY)

function notificationApn(alert, payload = {}) {
  return new apn.Notification({
    badge: 0,
    sound: 'ping.aiff',
    alert,
    payload: { payload },
    topic: 'com.negebauer.GithubPushNotificationsMobile',
    contentAvailable: true,
    priority: 10,
  })
}

function notificationGcm(alert, token, payload = {}) {
  return new gcm.Message({
    priority: 'high',
    restrictedPackageName: 'com.negebauer.GithubPushNotificationsMobile',
    data: {
      data: payload,
      title: 'Github Push',
      icon: 'ic_launcher',
      message: alert,
      sound: 'default',
  })
}

function notifyApn(token, alert, payload) {
  return providerApn.send(notificationApn(alert, payload), token).catch(raven.captureException)
}

async function notifyGcm(token, alert, payload) {
  return new Promise((res, rej) => {
    function handler(err, response) {
      if (err) return rej(err)
      res(response)
    }
    return providerGcm.send(notificationGcm(alert, token, payload), { to: token }, handler)
  })
  .then(response => {
    console.log('response', response);
  })
  .catch(err => {
    console.log('err', err);
  })
}

function notifyMultiple(devices, alert, payload) {
  return devices.map(device => notifyDevice(device, alert, payload))
}

function notifyDevice(device, alert, payload) {
  const { token, deviceName, systemName } = device
  if (!token) return
  return systemName === 'iOS'
    ? notifyApn(token, alert, payload)
    : notifyGcm(token, alert, payload)
}

function notify(devices, alert = 'Github Push', payload) {
  return Array.isArray(devices)
    ? notifyMultiple(devices, alert, payload)
    : notifyMultiple([devices], alert, payload)
}

function flatten(array) {
  return array.reduce((total, current) => total.concat(current), [])
}

async function getDevices(userIds) {
  let query = { _id: Array.isArray(userIds) ? userIds : [userIds] }
  const users = await User.find(query)
  const devices = users.map(u => u.devices)
  return flatten(devices)
}

const NOTIFICATION_TYPE = keyMirror({
  NEW_NOTIFICATION: undefined,
})

const Notification = {
  newNotifications: async (userId, notifications) => {
    const devices = await getDevices(userId)
    return Promise.all(notifications.map(notification => {
      const message = messageForNotification(notification)
      const url = urlForNotification(notification)
      const payload = { url, type: NOTIFICATION_TYPE.NEW_NOTIFICATION }
      return Promise.all(notify(devices, message, payload))
    }))
  },
  unauthorizedToken: async (userId) => {
    const devices = await getDevices(userId)
    const message = 'Your token expired, please open the app again to receive notifications'
    return notify(devices, message)
  }
}

module.exports = Notification
