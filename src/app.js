const Koa = require('koa')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')
const router = require('./routes')
const setupDb = require('./db')
const setupJobs = require('./jobs')

const { kue, queue } = setupJobs()

const app = new Koa()
app.context.db = setupDb()
app.context.queue = queue
app.use(cors())
app.use(logger('dev'))
app.use(bodyParser())
app.use(router.routes())

module.exports = app
