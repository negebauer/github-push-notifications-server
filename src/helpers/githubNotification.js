const keyMirror = require('keymirror')

const GITHUB_URL = 'https://github.com'

const API_ENDPOINT_TO_SITE = {
  issues: 'issues',
  pulls: 'pull',
  commits: 'commit',
}

const API_NOTIFICATION_TYPE = keyMirror({
  PullRequest: undefined,
  Commit: undefined,
  Issue: undefined,
  RepositoryVulnerabilityAlert: undefined,
})

const API_NOTIFICATION_TYPE_TO_MESSAGE = {
  [API_NOTIFICATION_TYPE.PullRequest]: 'pull request',
  [API_NOTIFICATION_TYPE.Commit]: 'commit',
  [API_NOTIFICATION_TYPE.Issue]: 'issue',
  [API_NOTIFICATION_TYPE.RepositoryVulnerabilityAlert]: 'security alert',
}

const API_NOTIFICATION_TYPES_WITH_ID = [
  API_NOTIFICATION_TYPE.PullRequest,
  API_NOTIFICATION_TYPE.Issue,
]

const NOTIFICATION_REASONS = {
  // You were assigned to the Issue.
  assign:	'that you\'re assigned',
  // You created the thread.
  author:	'that you created',
  // You commented on the thread.
  comment: 'which you commented',
  // You accepted an invitation to contribute to the repository.
  invitation:	'that you accepted contribution',
  // You subscribed to the thread (via an Issue or Pull Request).
  manual:	'that you subscribed to',
  // You were specifically @mentioned in the content.
  mention: 'that you were mentioned',
  // You changed the thread state (for example, closing an Issue or merging a Pull Request).
  state_change:	'that you changed',
  // You're watching the repository.
  subscribed:	'in repo that you\'re watching',
  // You were on a team that was mentioned.
  team_mention:	'that your team was mentioned',
  // You were requested for a review
  review_requested: 'that you were requested to review',
  // A securiy alert was triggered
  security_alert: '',
}

function messageForNotification(notification) {
  const {
    repository: { full_name: fullName },
    subject: { title, url: apiUrl, latest_comment_url, type },
    reason,
  } = notification
  let [ empty, endpoint, id ] = apiUrl.split(fullName)[1].split('/')
  const messageInit = API_NOTIFICATION_TYPES_WITH_ID.indexOf(type) >= 0
    ? `${fullName}#${id}`
    : `${fullName}`
  const messageBody = apiUrl === latest_comment_url
    ? `${API_NOTIFICATION_TYPE_TO_MESSAGE[type]}`
    : `update in ${API_NOTIFICATION_TYPE_TO_MESSAGE[type]}`
  const messageReason = NOTIFICATION_REASONS[reason]
    ? ` ${NOTIFICATION_REASONS[reason]}`
    : ''
  const message = `${messageInit}: ${messageBody}${messageReason} - ${title}`
  return message
}

function urlForNotification(notification) {
  const {
    repository: { full_name: fullName },
    subject: { url: apiUrl },
  } = notification
  let [ empty, endpoint, id ] = apiUrl.split(fullName)[1].split('/')
  if (API_ENDPOINT_TO_SITE[endpoint]) endpoint = API_ENDPOINT_TO_SITE[endpoint]
  return `${GITHUB_URL}/${fullName}/${endpoint}/${id}`
}

module.exports = { messageForNotification, urlForNotification }
