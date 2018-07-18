const Router = require('koa-router')

const router = new Router()

router.get('/', ctx => {
  return ctx.body = {
    live: true,
    message: 'Hello'
  }
})

module.exports = router
