const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Device = new Schema({
  token: String,
  uid: String, // e.g. FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9
  manufacturer: String, // e.g. Apple
  brand: String, // e.g. Apple / htc / Xiaomi
  model: String, // e.g. iPhone 6
  deviceId: String, // e.g. iPhone7,2 / or the board on Android e.g. goldfish
  OS: String, // e.g. iPhone OS
  system: String, // e.g. 9.0
  buildNumber: String, // e.g. 89
  version: String, // e.g. 1.1.0
  name: String, // e.g. Becca's iPhone 6
  agent: String, // e.g. Dalvik/2.1.0 (Linux; Android 5.1)
  locale: String, // e.g en-US
  country: String, // e.g US
  timezone: String, // e.g America/Mexico_City
})

const model = 'user'
const UserSchema = new Schema({
  devices: [Device],
  token: String,
  name: String,
  email: String,
  avatarUrl: String,
  username: {
    type: String,
    unique: true,
  },
  jobId: String,
})

UserSchema.methods = {}

module.exports = mongoose.model(model, UserSchema)
