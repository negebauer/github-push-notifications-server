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

/*
List notifications
participating   If true, only shows notifications in which the user is directly participating or mentioned. Default: false

Notification reasons
assign          You were assigned to the Issue.
author          You created the thread.
comment         You commented on the thread.
invitation      You accepted an invitation to contribute to the repository.
manual          You subscribed to the thread (via an Issue or Pull Request).
mention         You were specifically @mentioned in the content.
state_change    You changed the thread state (for example, closing an Issue or merging a Pull Request).
subscribed      You're watching the repository.
team_mention    You were on a team that was mentioned.
*/

const NotificationSettings = new Schema({
  participating: {
    type: Boolean,
    default: false,
  },
  assign: {
    type: Boolean,
    default: true,
  },
  author: {
    type: Boolean,
    default: true,
  },
  comment: {
    type: Boolean,
    default: true,
  },
  invitation: {
    type: Boolean,
    default: false,
  },
  manual: {
    type: Boolean,
    default: true,
  },
  mention: {
    type: Boolean,
    default: true,
  },
  state_change: {
    type: Boolean,
    default: true,
  },
  subscribed: {
    type: Boolean,
    default: false,
  },
  team_mention: {
    type: Boolean,
    default: true,
  }
}, { _id: false })

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
  notificationSettings: {
    type: NotificationSettings,
    default: {},
  },
})

UserSchema.methods = {}

module.exports = mongoose.model(model, UserSchema)
