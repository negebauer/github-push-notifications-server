const Router = require('koa-router')
const _ = require('lodash')

const router = new Router()

router.get('/notifications', ctx => {
  const { user: { notificationSettings } } = ctx.state
  return ctx.body = notificationSettings
})

router.patch('/notifications', async ctx => {
  const { user } = ctx.state
  user.notificationSettings = { ...user.notificationSettings.toObject(), ...ctx.request.body }
  await user.save()
  ctx.body = user.notificationSettings
})

module.exports = router
