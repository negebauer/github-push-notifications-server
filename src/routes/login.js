const Router = require('koa-router')
const axios = require('axios')
const User = require('../models/user')
const { DEACTIVATE_FETCH_NOTIFICATIONS } = require('../env')
const { checkFetchNotifications } = require('../queue/jobs/fetchNotifications')

const router = new Router()

router.post('/', async ctx => {
  const { token } = ctx.request.body

  const profileUrl = `https://api.github.com/user?access_token=${token}`
  let response
  try {
    response = await axios.get(profileUrl)
  } catch (err) {
    if (err.response.status === 401) return ctx.throw(401, 'Bad credentials')
    else ctx.throw()
  }

  const { data: { email, name, login: username, avatar_url: avatarUrl } } = response
  let user = await User.findOne({ username })
  if (!user) {
    user = new User({ username })
    await user.save()
  }
  await user.update({ email, name, token, avatarUrl })
  if (!DEACTIVATE_FETCH_NOTIFICATIONS) checkFetchNotifications(user)

  const { _id } = user
  return ctx.body = { _id, username, name, token, avatarUrl }
})

module.exports = router
