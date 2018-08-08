const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Device = new Schema({
  token: String,
  applicationName: String,
  buildNumber: String,
  bundleId: String,
  carrier: String,
  model: String,
  systemName: String,
  systemVersion: String,
  timezone: String,
  uid: String,
  version: String,
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
