const mongoose = require('mongoose')
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = require('./env')

mongoose.Promise = global.Promise

const dbHost = DB_HOST
const dbName = DB_NAME
const dbAuth = DB_USER && DB_PASSWORD ? `${DB_USER}:${DB_PASSWORD}@` : ''
const URI = `mongodb://${dbAuth}${dbHost}/${dbName}`

mongoose.connect(URI, { useNewUrlParser: true })
const db = mongoose.connection
db.on('connected', () => console.log('[MONGO] Connected')); // eslint-disable-line no-console
db.on('disconnected', () => console.log('[MONGO] Disconnected')); // eslint-disable-line no-console
db.on('error', err => {
  console.error('[MONGO] Connection error:', err) // eslint-disable-line no-console
  process.exit(1)
})

function dbShutdown() {
  return mongoose.disconnect()
}

return db

module.exports = db
