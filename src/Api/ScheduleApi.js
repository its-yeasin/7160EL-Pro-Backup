const { addTask, getTasksStatus, removeTask, restartTask } = require('../Models/Tasks/TasksModel')
const { getDocument, DB_SOURCE } = require('../utils/PouchDbTools')

// backup create and backup start
const scheduleStart = async (ev, id) => {
  // Collect the backup source
  const sourceInfo = await getDocument(DB_SOURCE, id)
  if (sourceInfo.error === 1) {
    return { error: 1, message: 'Source not found', data: null }
  }

  // Creating a new task
  addTask(sourceInfo.data)
  restartTask()

  const st = getTasksStatus()
  return { error: 0, message: 'Backup Schedule Started', data: st }
}

// backup destroy and backup stop
const scheduleStop = async (ev, id) => {
  // Collect the backup source
  const sourceInfo = await getDocument(DB_SOURCE, id)
  if (sourceInfo.error === 1) {
    return { error: 1, message: 'Source not found', data: null }
  }

  // Remove the task
  removeTask(sourceInfo.data)
  restartTask()

  const st = getTasksStatus()
  return { error: 0, message: 'Backup Schedule Stopped', data: st }
}

module.exports = {
  scheduleStart,
  scheduleStop,
}
