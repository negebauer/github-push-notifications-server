const kue = require('kue')

function getJob(id) {
  return new Promise((res, rej) => {
    kue.Job.get(id, (err, job) => {
      if (err) rej(err)
      else res(job)
    })
  })
}

module.exports = {
  getJob,
}
