const {
  PORT,
  NODE_ENV: NODE_ENV_RAW,
  DEACTIVATE_FETCH_NOTIFICATIONS,     // Dont start fetchNotifications jobs
  IOS_NOTIFICATIONS_PEM_DEVELOPMENT,  // base64 pem file
  IOS_NOTIFICATIONS_PEM_PRODUCTION,   // base64 pem file
  DB_USER,                            // Mongo database
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  REDIS_PORT,                         // Redis database
  REDIS_HOST,
  REDIS_PASSWORD,
  SENTRY_URL,                         // Sentry DSN for error reporting
  RELEASE,                            // Release version
} = process.env

const NODE_ENV = NODE_ENV_RAW || 'development'

module.exports = {
  PORT: PORT || 3000,
  DEACTIVATE_FETCH_NOTIFICATIONS,
  IOS_NOTIFICATIONS_PEM_DEVELOPMENT,
  IOS_NOTIFICATIONS_PEM_PRODUCTION,
  DB_USER,
  DB_PASSWORD,
  DB_HOST: DB_HOST || 'localhost:27017',
  DB_NAME: DB_NAME || 'github-push-notifications-server',
  REDIS_PORT: REDIS_PORT || 6379,
  REDIS_HOST: REDIS_HOST || 'localhost',
  REDIS_PASSWORD: REDIS_PASSWORD || '',
  SENTRY_URL,
  RELEASE: RELEASE || 'dev',

  NODE_ENV,
  PRODUCTION: NODE_ENV === 'production',
  DEVELOPMENT: NODE_ENV === 'development',
}
