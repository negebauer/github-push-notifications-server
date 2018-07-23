const apn = require('apn')
const gcm = require('node-gcm')
// const gcmKey = require('../certificates/gcm.json').key
const keyMirror = require('keymirror')
const User = require('./models/user')
const {
  ENV,
  PRODUCTION,
  IOS_NOTIFICATIONS_PEM_DEVELOPMENT,
  IOS_NOTIFICATIONS_PEM_PRODUCTION,
} = require('./constants')
const { messageForNotification, urlForNotification } = require('./helpers/notification')

function loadApnCertificateFromEnv() {
  const rawCert = PRODUCTION
    ? IOS_NOTIFICATIONS_PEM_PRODUCTION
    : IOS_NOTIFICATIONS_PEM_DEVELOPMENT
  const certBuffer = Buffer.from(rawCert, 'base64')
  return certBuffer
}

const apnCertificate = IOS_NOTIFICATIONS_PEM_DEVELOPMENT && IOS_NOTIFICATIONS_PEM_PRODUCTION
  ? loadApnCertificateFromEnv()
  : `./certificates/${ENV}_com.negebauer.GithubPushNotificationsMobile.pem`

const optionsApn = {
  cert: apnCertificate,
  key: apnCertificate,
  production: false,
}

const providerApn = new apn.Provider(optionsApn)
// const providerGcm = new gcm.Sender(gcmKey)

function notificationApn(alert, payload = {}) {
  return new apn.Notification({
    badge: 0,
    sound: 'ping.aiff',
    alert,
    payload,
    topic: 'com.negebauer.GithubPushNotificationsMobile',
    contentAvailable: true,
    priority: 10,
  })
}

function notificationGcm() {
  return Promise.resolve()
}

// const notificationGcm = (alert, payload = {}) =>
//   new gcm.Message({
//     priority: 'high',
//     contentAvailable: true,
//     delayWhileIdle: true,
//     restrictedPackageName: 'com.negebauer.GithubPushNotificationsMobile',
//     data: { payload },
//     notification: {
//       title: 'Github Push',
//       icon: 'ic_launcher',
//       body: alert,
//     },
//   })

function notifyApn(token, alert, payload) {
  return providerApn.send(notificationApn(alert, payload), token)
}

function notifyGcm() {
  return {}
}

// const notifyGcm = async (token, alert, payload) =>
//   new Promise((res, rej) =>
//     providerGcm.send(
//       notificationGcm(alert, payload),
//       {
//         registrationTokens: Array.isArray(token) ? token : [token],
//       },
//       (err, response) => (err ? rej(err) : res(response))
//     )
//   )

function notifyMultiple(devices, alert, payload) {
  return devices.map(device => notifyDevice(device, alert, payload))
}

function notifyDevice(device, alert, payload) {
  const { token, deviceName, systemName } = device
  if (!token) return
  // eslint-disable-next-line no-console
  // console.log('notify', payload.type, token, deviceName)
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
    return Promise.all[notifications.map(notification => {
      const message = messageForNotification(notification)
      const url = urlForNotification(notification)
      const payload = { url, type: NOTIFICATION_TYPE.NEW_NOTIFICATION }
      return notify(devices, message, payload)
    })]
  },
}

module.exports = Notification
