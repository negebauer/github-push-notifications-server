const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Device = new Schema({
  token: String,
  hardware: String
})

const model = 'user'
const UserSchema = new Schema({
  devices: [Device],
  accessToken: String,
  email: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
  },
})

UserSchema.methods = {}

module.exports = mongoose.model(model, UserSchema)
