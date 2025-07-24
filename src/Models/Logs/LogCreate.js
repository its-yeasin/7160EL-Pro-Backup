const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { app } = require('electron')

// Get the appropriate logs directory for the app
const getLogsDirectory = () => {
  if (app && app.getPath && app.isPackaged) {
    // In packaged Electron environment, use userData directory
    const logsPath = path.join(app.getPath('userData'), 'Logs')
    console.log('Using packaged app logs directory:', logsPath)
    return logsPath
  } else {
    // Fallback for development/non-Electron environments
    const logsPath = path.resolve('Logs')
    console.log('Using development logs directory:', logsPath)
    return logsPath
  }
}

const LOG_DIR_LOCAL = getLogsDirectory()
const LOG_DIR_REMOTE = 'logs'

const createLog = (logType, logText) => {
  const logFilename = path.join(
    LOG_DIR_LOCAL,
    `Log_${logType}_${moment().format('YYYY_MM_DD_HH')}.log`,
  )
  const logEntry = `${moment().format('YYYY-MM-DD HH:mm:ss')} - ${logText}\n`

  try {
    if (!fs.existsSync(LOG_DIR_LOCAL)) {
      fs.mkdirSync(LOG_DIR_LOCAL, { recursive: true, mode: 0o755 })
      console.log('Created logs directory:', LOG_DIR_LOCAL)
    }

    fs.openSync(logFilename, 'a')
    fs.appendFileSync(logFilename, logEntry)
  } catch (error) {
    console.error('Error creating log:', error)
    // Fallback: try to log to console if file system fails
    console.log(`LOG [${logType}] ${moment().format('YYYY-MM-DD HH:mm:ss')} - ${logText}`)
  }
}

const createErrorLog = (logText) => {
  if (typeof logText === 'object') {
    logText = JSON.stringify(logText)
  }
  createLog('Error', logText)
}

const createSuccessLog = (logText) => {
  if (typeof logText === 'object') {
    logText = JSON.stringify(logText)
  }
  createLog('Success', logText)
}

const createBackupLog = (sourceId, logText) => {
  if (typeof logText === 'object') {
    logText = JSON.stringify(logText)
  }
  console.log(`${sourceId} - ${logText}`)
  createLog('Backup', `${sourceId} - ${logText}`)
}

module.exports = {
  LOG_DIR_LOCAL,
  LOG_DIR_REMOTE,
  createErrorLog,
  createSuccessLog,
  createBackupLog,
}
