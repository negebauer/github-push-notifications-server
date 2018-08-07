const fs = require('fs')

const Koa = require('koa')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')
const raven = require('raven')
const { SENTRY_URL, NODE_ENV } = require('./env')
const router = require('./routes')
require('./db')
require('./queue')
require('./queue/configHandlers')
require('./notifications')

raven.config(SENTRY_URL, { release: NODE_ENV }).install()
const app = new Koa()

app.use(cors())
app.use(logger('dev'))
app.use(bodyParser())
app.use(router.routes())

process.on('warning', e => console.warn(e.stack))

module.exports = app
