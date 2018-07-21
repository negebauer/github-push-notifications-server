const Router = require('koa-router')

const router = new Router()

router.get('/', ctx => {
  const { user: { username, devices } } = ctx.state
  return ctx.body = {
    username,
    devices,
  }
})

router.post('/', async ctx => {
  const { user } = ctx.state
  const { body } = ctx.request
  let device = user.devices.filter(device => device.uid === body.uid)[0]
  if (!device) {
    device = user.devices.create(body)
    user.devices.push(device)
  } else {
    _.merge(device, body)
  }
  await user.save()
  return ctx.body = device
})

router.delete('/:id', async ctx => {
  const { user } = ctx.state
  const { id } = ctx.params
  const device = user.devices.id(id)
  device.remove()
  await user.save()
  return ctx.status = 204
})

module.exports = router
