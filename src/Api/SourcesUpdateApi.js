const { DB_SOURCE, getDocument, updateDocument } = require('../utils/PouchDbTools')
const cornParser = require('cron-parser')
const { addTask, removeTask, restartTask } = require('../Models/Tasks/TasksModel')

// frequency = hourly, daily
const allowedFrequency = ['hourly', 'daily']

// update source autoStart property only
const updateAutoStart = async (ev, data) => {
  // data._id: '',
  // data.autostart: true,

  if (!data._id) {
    return { error: 1, message: 'Source ID not found', data: null }
  }

  try {
    // Check if database already exists
    const dataSt = await getDocument(DB_SOURCE, data._id)
    if (dataSt.error) {
      return { error: 1, message: 'Source not exists', data: null }
    }
    const exData = dataSt.data

    const updateSt = await updateDocument(DB_SOURCE, data._id, {
      ...exData,
      autostart: !!data.autostart,
    })
    if (updateSt.error) {
      return { error: 1, message: 'Error on updating Auto Start', data: null }
    }

    return { error: 0, message: 'Auto start status updated', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on updating Auto start', data: null }
  }
}

// update frequency
const updateFrequency = async (ev, data) => {
  // data._id: '',
  // data.frequency: 'hourly',
  // data.frequencyPattern: '0 49 * * * *',
  // data.backupQuantity: 100,
  // data.backupRetention: 30,

  if (!data._id) {
    return { error: 1, message: 'Source ID not found', data: null }
  }

  if (!allowedFrequency.includes(data.frequency)) {
    return { error: 1, message: 'Frequency (' + data.frequency + ') not allowed', data: null }
  }

  // Validate Pattern
  try {
    cornParser.parseExpression(data.frequencyPattern)
  } catch (err) {
    return { error: 1, message: 'Invalid frequency pattern', data: null }
  }

  if (data.backupQuantity < 10) {
    return { error: 1, message: 'Backup quantity must be greater or equal than 10', data: null }
  }

  if (data.backupRetention < 7) {
    return { error: 1, message: 'Backup retention must be greater or equal than 7', data: null }
  }

  try {
    // Check if database already exists
    const dataSt = await getDocument(DB_SOURCE, data._id)
    if (dataSt.error) {
      return { error: 1, message: 'Source not exists', data: null }
    }
    const exData = dataSt.data

    const result = await updateDocument(DB_SOURCE, data._id, {
      ...exData,
      frequency: data.frequency,
      frequencyPattern: data.frequencyPattern,
      backupQuantity: data.backupQuantity,
      backupRetention: data.backupRetention,
    })
    if (result.error) {
      return { error: 1, message: 'Error on updating frequency', data: null }
    }

    // Remove Source from Task
    removeTask(exData)

    // Collect new source and update it
    const sourceSt = await getDocument(DB_SOURCE, data._id)
    if (sourceSt.error) {
      return { error: 1, message: 'Source not found', data: null }
    }
    const sourceInfo = sourceSt.data

    // Adding the task
    addTask(sourceInfo)

    // Restart Task
    restartTask()

    return { error: 0, message: 'Frequency updated successfully', data: result }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on updating frequency', data: null }
  }
}

module.exports = {
  updateAutoStart,
  updateFrequency,
}
