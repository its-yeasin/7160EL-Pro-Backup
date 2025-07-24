const fsp = require('fs').promises
const path = require('path')
const ConfigKeys = require('../Models/Configs/ConfigKeys')
const { setDefDirectory } = require('../Models/Configs/ConfigDefaultDir')
const { DB_CONFIG, getAllDocuments, getDocument } = require('../utils/PouchDbTools')
const { isDirExists } = require('../utils/FileOperation')
const { setNotfEmail } = require('../Models/Configs/ConfigNotification')

const getConfigs = async () => {
  try {
    const data = await getAllDocuments(DB_CONFIG)

    const confData = {}
    for (const conf of data) {
      confData[conf._id] = conf.value
    }

    return { error: 0, message: 'List of Configs', data: confData }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

const setDefaultDirectory = async (ev, data) => {
  const { directory } = data

  // Create of Update new Line
  try {
    await setDefDirectory(directory)

    return { error: 0, message: 'Default Directory Set', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on setting default directory', data: null }
  }
}

const setNotificationEmail = async (ev, data) => {
  const { notificationEmail } = data

  //validate using regex
  const validateEmail = await notificationEmail.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)

  if (validateEmail === null) {
    return { error: 1, message: 'Invalid email', data: null }
  }

  // Create of Update new Line
  try {
    await setNotfEmail(notificationEmail)

    return { error: 0, message: 'Notification email Set', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on setting notification email', data: null }
  }
}

const defaultDirCleanup = async (ev, data) => {
  console.log('Default Directory Cleanup', data)
  try {
    // Collect Default Directory
    const defDirConf = await getDocument(DB_CONFIG, ConfigKeys.CONF_DEFAULT_DIRECTORY)
    if (defDirConf.error) {
      return { error: 1, message: 'Default Directory not found', data: null }
    }

    // Check if directory exists
    const dirExist = await isDirExists(defDirConf.data.value)
    if (dirExist.error) {
      return { error: 1, message: 'Default Directory not exists', data: null }
    }

    const excludeFiles = ['.config']

    // Cleanup Default Directory
    const files = await fsp.readdir(defDirConf.data.value)
    for (const file of files) {
      if (excludeFiles.includes(file)) {
        continue
      }
      const filePath = path.join(defDirConf.data.value, file)
      await fsp.rm(filePath, { recursive: true, force: true })
    }

    return { error: 0, message: 'Default Directory Cleaned Successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on cleanup default directory', data: null }
  }
}

module.exports = {
  getConfigs,
  setDefaultDirectory,
  setNotificationEmail,
  defaultDirCleanup,
}
