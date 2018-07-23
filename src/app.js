const fs = require('fs')

const Koa = require('koa')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')
const router = require('./routes')
require('./db')
require('./queue')
require('./queueProcessers')
require('./notifications')

const app = new Koa()
app.use(cors())
app.use(logger('dev'))
app.use(bodyParser())
app.use(router.routes())

process.on('warning', e => console.warn(e.stack))

module.exports = app
