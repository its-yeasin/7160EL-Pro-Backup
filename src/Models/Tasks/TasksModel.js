const moment = require('moment')
const { createErrorLog } = require('../Logs/LogCreate')
const { evSendTaskStatus } = require('./Ev')
const { getNextRunTime } = require('../../utils/Cron')
const { forceBackup } = require('../Backup/BackupForce')
const { cleanupBackups } = require('../../Api/SourcesBackupApi')
const { exportingData } = require('../Maintenance/Maintenance')
const { logFilesFixing } = require('../Logs/LogOperation')
const { logCronPattern } = require('../../utils/DefaultValue')

const tasks = []
let isTaskRunning = null

const backupActionByTask = async (task) => {
  const id = task._id
  const nextRun = getNextRunTime(task.frequencyPattern).unix() - 1
  const now = moment().unix()
  if (nextRun !== now) {
    return
  }

  try {
    await forceBackup(null, id) // Backup Process
    await cleanupBackups(null, { sourceId: id }) // Cleanup Process
    await exportingData('') // Exporting Data
  } catch (err) {
    createErrorLog(`Task ${id} error: ${err.message}`)
    createErrorLog(JSON.stringify(err))
    evSendTaskStatus(id, 'error')
  }
}

const logActionByTask = async () => {
  // logCronPattern is from default value
  const nextRun = getNextRunTime(logCronPattern).unix() - 1
  const now = moment().unix()
  if (nextRun !== now) {
    return
  }

  try {
    logFilesFixing(now)
  } catch (err) {
    createErrorLog(`Task Log Upload Error: ${err.message}`)
    createErrorLog(JSON.stringify(err))
  }
}

const executeTask = () => {
  // Backup Task
  for (const task of tasks) {
    backupActionByTask(task)
  }

  // Log Task
  logActionByTask()
}

const startTask = () => {
  if (isTaskRunning) {
    return
  }

  isTaskRunning = setInterval(executeTask, 1000)
}

const stopTask = () => {
  // clear timeout
  clearInterval(isTaskRunning)
  isTaskRunning = null
}

const addTask = (source) => {
  if (tasks.find((task) => task._id === source._id)) {
    return
  }
  tasks.push(source)
}

const removeTask = (source) => {
  const index = tasks.findIndex((task) => task._id === source._id)
  if (index === -1) {
    return
  }
  tasks.splice(index, 1)
}

const restartTask = () => {
  stopTask()
  startTask()
}

const getTasks = () => {
  return tasks
}

const getTaskStatus = (id) => {
  const st = tasks.find((task) => task._id === id)

  if (!st) {
    return {
      id,
      running: false,
      nextRun: 0,
      timeRemaining: 0,
      pattern: '',
    }
  }

  return {
    id: st._id,
    running: true,
    nextRun: getNextRunTime(st.frequencyPattern).unix(),
    timeRemaining: getNextRunTime(st.frequencyPattern).diff(new Date(), 'seconds'),
    pattern: st.frequencyPattern,
  }
}

const getTasksStatus = () => {
  return tasks.map((task) => {
    return {
      id: task._id,
      running: true,
      nextRun: getNextRunTime(task.frequencyPattern).unix(),
      timeRemaining: getNextRunTime(task.frequencyPattern).diff(new Date(), 'seconds'),
      pattern: task.frequencyPattern,
    }
  })
}

module.exports = {
  restartTask,
  addTask,
  removeTask,
  getTasks,
  getTaskStatus,
  getTasksStatus,
}
