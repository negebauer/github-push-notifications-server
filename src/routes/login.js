const Router = require('koa-router')
const axios = require('axios')
const User = require('../models/user')
const { createFirstFetchNotifications } = require('../queueTasks/fetchNotifications')

const router = new Router()

router.post('/', async ctx => {
  const { token } = ctx.request.body

  const profileUrl = `https://api.github.com/user?access_token=${token}`
  const { data: { email, name, login: username, avatar_url: avatarUrl } } = await axios.get(profileUrl)

  let user = await User.findOne({ username })
  if (!user) {
    user = new User({ username })
    await user.save()
  }
  await user.update({ email, name, token, avatarUrl })
  createFirstFetchNotifications(username)

  const { _id } = user
  return ctx.body = { _id, username, name, token, avatarUrl }
})

module.exports = router
