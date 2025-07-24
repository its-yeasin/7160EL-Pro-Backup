const moment = require('moment')
const { getDefDirectory } = require('./ConfigDefaultDir')

const generateFilePath = async (sourceData) => {
  const dateNow = moment().format('YYYYMMDD_HHmmss')

  if (sourceData.type === 'directory') {
    return { error: 0, message: 'Directory Path', data: null, skipped: true }
  }

  try {
    // Default Directory
    const defaultDirectory = await getDefDirectory()
    if (defaultDirectory.error) {
      return defaultDirectory
    }
    const defDirPath = defaultDirectory.data

    // File Name
    const fileName = `${sourceData.type}_${sourceData.databaseOrPath}_${dateNow}.bak`

    // File Path
    return { error: 0, message: 'File Path', data: { defDirPath, fileName } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: err.message, data: null }
  }
}

const generateDirPath = async (sourceData) => {
  const dateNow = moment().format('YYYYMMDD_HHmmss')

  if (sourceData.type !== 'directory') {
    return { error: 0, message: 'DB Path', data: null, skipped: true }
  }

  try {
    // Default Directory
    const defaultDirectory = await getDefDirectory()
    if (defaultDirectory.error) {
      return defaultDirectory
    }
    const defDirPath = defaultDirectory.data

    const dName = sourceData.databaseOrPath.replace(/[^a-zA-Z0-9]/g, '_')
    const dirName = `directory_${dateNow}_${dName}`

    return { error: 0, message: 'Directory Path', data: { defDirPath, dirName } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: err.message, data: null }
  }
}

module.exports = {
  generateFilePath,
  generateDirPath,
}
