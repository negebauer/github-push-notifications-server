const Router = require('koa-router')

const userAuth = require('../helpers/userAuth')

const home = require('./home')
const login = require('./login')
const config = require('./config')
const devices = require('./devices')

const router = new Router()

// public routes
router.use('/', home.routes())
router.use('/login', login.routes())

// user authentication
router.use(userAuth)

// private routes
router.use('/config', config.routes())
router.use('/devices', devices.routes())

module.exports = router
