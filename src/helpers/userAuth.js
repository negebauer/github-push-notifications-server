const User = require('../models/user')

/**
 *  Sends an unauthorized error message
 *  @author @negebauer
 *  @param  {String} [message='Unauthorized.'] An optional message to display
 */
function unauthorized(ctx, message = 'Unauthorized.') {
  ctx.status = 401
  const error = new Error()
  error.message = message
  return (ctx.body = error)
}

/**
 *  Verifies if the request has an access token
 *  access_token has priority over
 *  Authorization header
 *  @author @negebauer
 */
async function userAuth(ctx, next) {
  const { access_token: queryAccessToken } = ctx.request.query
  const { authorization = '' } = ctx.request.headers
  const [name, headersAccessToken] = authorization.split(' ')
  if (!queryAccessToken && !headersAccessToken) return unauthorized(ctx)
  const token = queryAccessToken ? queryAccessToken : headersAccessToken
  try {
    const user = await User.findOne({ token })
    ctx.user = user
    return next()
  } catch (err) { return unauthorized(ctx, err.message) }
}

module.exports = userAuth
