const moment = require('moment')
const cronParser = require('cron-parser')

const getNextRunTime = (pattern) => {
  const interval = cronParser.parseExpression(pattern)
  const nextRun = interval.next().toDate()
  return moment(nextRun)
}

module.exports = {
  getNextRunTime,
}
