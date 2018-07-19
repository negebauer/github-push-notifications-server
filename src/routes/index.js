const Router = require('koa-router')

const userAuth = require('../helpers/userAuth')

const home = require('./home')
const login = require('./login')
const notifications = require('./notifications')

const router = new Router()

// public routes
router.use('/', home.routes())
router.use('/login', login.routes())

// user authentication
router.use(userAuth)

// private routes
router.use('/notifications', notifications.routes())

module.exports = router
