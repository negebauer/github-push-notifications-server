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
} = process.env

const NODE_ENV = NODE_ENV_RAW || 'development'

module.exports = {
  PORT,
  DEACTIVATE_FETCH_NOTIFICATIONS,
  IOS_NOTIFICATIONS_PEM_DEVELOPMENT,
  IOS_NOTIFICATIONS_PEM_PRODUCTION,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  REDIS_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,

  NODE_ENV,
  PRODUCTION: NODE_ENV === 'production',
  DEVELOPMENT: NODE_ENV === 'development',
}
