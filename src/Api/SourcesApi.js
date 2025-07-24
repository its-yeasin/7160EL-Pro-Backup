const { sourceDataPattern, countUploads } = require('../Models/Sources/SourcesData')
const {
  DB_UPLOADS,
  DB_SOURCE,
  getAllDocuments,
  createDocument,
  deleteDocument,
  updateDocument,
  getDocument,
} = require('../utils/PouchDbTools')
const { validateAll } = require('../utils/Validate')
const { getTasksStatus, getTaskStatus, addTask } = require('../Models/Tasks/TasksModel')
const {
  validateType,
  validateDirectory,
  validateMssqlWinData,
  validateMssqlHostData,
  validatePgsqlData,
} = require('../Models/Sources/SourcesValidate')
const { generateHash } = require('../utils/MyCrypto')

// Get Lists of Sources // ev, data
const getSources = async () => {
  try {
    const sourcesData = await getAllDocuments(DB_SOURCE)

    // Collect Uploads
    const uploads = await getAllDocuments(DB_UPLOADS)

    // Count total uploads by sourceId
    const sources = countUploads(sourcesData, uploads)

    // Sending test message
    const tasks = getTasksStatus()

    return { error: 0, message: 'List of Sources', data: sources, tasks: tasks }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

// Add a new Source
const addSource = async (ev, data) => {
  const hash = generateHash()
  const nData = { ...sourceDataPattern, ...data, _id: hash }

  try {
    // Check if database and _id already exists
    const exData = await getAllDocuments(DB_SOURCE)
    const ex = exData.find((x) => x.databaseOrPath === nData.databaseOrPath || x._id === hash)
    if (ex) {
      return { error: 1, message: 'Database already exists', data: null }
    }

    // Validation Permissions
    const exe1 = validateType(nData) // Validate Type
    const exe2 = validateMssqlWinData(nData) // Validate MsSQL-Win Data, if type is mssql-win
    const exe3 = validateMssqlHostData(nData) // Validate MsSQL-Host Data, if type is mssql-host
    const exe4 = validatePgsqlData(nData) // Validate PGSQL Data, if type is pgsql
    const exe5 = validateDirectory(nData) // Validate Directory Data, if type is directory

    // Data Validation
    const validate = validateAll([exe1, exe2, exe3, exe4, exe5])
    if (validate.error === 1) {
      return validate
    }

    const createSt = await createDocument(DB_SOURCE, nData)
    if (createSt.error) {
      return { error: 1, message: 'Error creating Source', data: null }
    }

    // Collect Recently Added Source
    const sourcesData = await getDocument(DB_SOURCE, hash)
    if (sourcesData.error === 0) {
      // Start Task
      addTask(sourcesData.data, false)
    }

    return { error: 0, message: 'Source added', data: createSt.data }
  } catch (err) {
    console.log(err)
    return { error: 1, message: err, data: null }
  }
}

// Update a Source
const updateSource = async (ev, data) => {
  const nData = { ...sourceDataPattern, ...data }

  try {
    // Check if database already exists
    const exData = await getAllDocuments(DB_SOURCE)
    // const exDbName = exData.find((x) => x.databaseOrPath === data.databaseOrPath)
    // if (exDbName) {
    //   return { error: 1, message: 'Source already exists', data: null }
    // }

    // Check if _id not exists
    const exId = exData.find((x) => x._id === data._id)
    if (!exId) {
      return { error: 1, message: 'Source not exists', data: null }
    }

    const exe1 = validateType(nData) // Validate Type
    const exe2 = validateMssqlWinData(nData) // Validate MsSQL-Win Data, if type is mssql-win
    const exe3 = validateMssqlHostData(nData) // Validate MsSQL-Host Data, if type is mssql-host
    const exe4 = validatePgsqlData(nData) // Validate PGSQL Data, if type is pgsql
    const exe5 = validateDirectory(nData) // Validate Directory Data, if type is directory

    // Data Validation
    const validate = validateAll([exe1, exe2, exe3, exe4, exe5])
    if (validate.error === 1) {
      return validate
    }

    const updateSt = await updateDocument(DB_SOURCE, data._id, nData)
    if (updateSt.error) {
      return { error: 1, message: 'Error updating Source', data: null }
    }

    return { error: 0, message: 'Source updated', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on updating Source', data: null }
  }
}

const deleteSource = async (ev, data) => {
  try {
    const sourceSt = await getDocument(DB_SOURCE, data._id)
    if (sourceSt.error === 1) {
      return { error: 1, message: 'Source not found', data: null }
    }

    // Cont get task status
    const task = getTaskStatus(data._id)
    if (task.running) {
      return {
        error: 1,
        message: 'Task is already running. Please stop it then try to delete.',
        data: null,
      }
    }

    const delSt = await deleteDocument(DB_SOURCE, data._id)
    if (delSt.error) {
      return { error: 1, message: 'Error deleting Source', data: null }
    }

    return { error: 0, message: 'Source deleted', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on deleting Source', data: null }
  }
}

// link destination to source
// API for link destination to source
const linkDestination = async (ev, data) => {
  try {
    // Check if database already exists
    const exData = await getAllDocuments(DB_SOURCE)

    // Check if _id not exists
    const exId = exData.find((x) => x._id === data._id)
    if (!exId) {
      return { error: 1, message: 'Source not exists', data: null }
    }

    const nData = {
      _id: data._id,
      type: data.type,
      databaseOrPath: data.databaseOrPath,
      host: data.host,
      user: data.user,
      password: data.password,
      directory: data.directory,
      running: data.running,
      destination: data.destination,
    }

    const updateSt = await updateDocument(DB_SOURCE, data._id, nData)
    if (updateSt.error) {
      return { error: 1, message: 'Error linking destination', data: null }
    }

    return { error: 0, message: 'Destination linked', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on linking destination', data: null }
  }
}

module.exports = {
  getSources,
  addSource,
  updateSource,
  deleteSource,
  linkDestination,
}
