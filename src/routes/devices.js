const Router = require('koa-router')

const router = new Router()

router.get('/', ctx => {
  const { user: { username, devices } } = ctx
  return ctx.body = {
    username,
    devices,
  }
})

router.post('/', ctx => {
  const { user } = ctx
  return ctx.body = {
    message: 'NOT_IMPLEMENTED',
  }
})

router.delete('/:id', ctx => {
  const { id } = ctx.params
  return ctx.body = {
    message: `NOT_IMPLEMENTED`,
    deviceId: id,
  }
})

module.exports = router
