const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Device = new Schema({
  token: String,
  hardware: String
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
})

UserSchema.methods = {}

module.exports = mongoose.model(model, UserSchema)
