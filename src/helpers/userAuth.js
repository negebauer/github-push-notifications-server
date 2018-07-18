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
  const { authorization } = ctx.request.headers
  const { access_token } = ctx.request.query
  if (!authorization && !access_token) return unauthorized(ctx)
  if (access_token) {
    ctx.token = access_token
    return next()
  }
  const [name, token] = authorization.split(' ')
  if (!name === 'token' || !token) return unauthorized(ctx, 'Expected Authorization: token <token>')
  ctx.token = token
  return next()
}

module.exports = userAuth
