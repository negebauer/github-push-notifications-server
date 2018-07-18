const Router = require('koa-router')

const router = new Router()

router.get('/', ctx => {
  const { token } = ctx
  return ctx.body = {
    message: 'NOT_IMPLEMENTED',
    token,
  }
})

module.exports = router
