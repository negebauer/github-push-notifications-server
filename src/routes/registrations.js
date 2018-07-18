const Router = require('koa-router')

const router = new Router()

router.get('/', ctx => {
  return ctx.body = {
    message: 'NOT_IMPLEMENTED',
  }
})

module.exports = router
