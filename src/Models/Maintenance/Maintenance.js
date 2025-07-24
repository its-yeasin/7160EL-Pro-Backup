const fsp = require('fs').promises
const path = require('path')
const { isFileExists, createDirForce, isDirExists } = require('../../utils/FileOperation')
const { getDefDirectory } = require('../Configs/ConfigDefaultDir')
const { getDestination, destinationDataPattern } = require('../Destinations/DestinationModel')
const { backupToBucket2 } = require('../GoogleBackup/GoogleBackup')
const { getAppId } = require('../Configs/ConfigAppId')
const { sourceDataPattern } = require('../Sources/SourcesData')
const { configDataPattern } = require('../Configs/ConfigKeys')
const { uploadDataPattern } = require('../Uploads/UploadData')
const {
  getAllDocuments,
  DB_SOURCE,
  DB_DESTINATION,
  DB_UPLOADS,
  DB_CONFIG,
  emptyDocument,
  createDocument,
} = require('../../utils/PouchDbTools')

const fileName = `config-exported.json`

// config-exported.json
const getExportFileName = async (appId = null) => {
  if (appId) {
    return { error: 0, message: 'Success', data: `${appId}-${fileName}` }
  }

  try {
    //--Collect app id
    const appIdSt = await getAppId()
    if (appIdSt.error) {
      return { error: 1, message: 'App Id not found', data: null }
    }

    return { error: 0, message: 'Success', data: `${appIdSt.data}-${fileName}` }
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

const resetData = async () => {
  try {
    await emptyDocument(DB_SOURCE)
    await emptyDocument(DB_DESTINATION)
    await emptyDocument(DB_UPLOADS)
    await emptyDocument(DB_CONFIG)

    return { error: 0, message: 'Data reset successfully', data: null }
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

const exportingData = async (dirPath) => {
  try {
    if (!dirPath) {
      const defDirConf = await getDefDirectory()
      if (defDirConf.error) {
        return { error: 1, message: 'Default Directory not found', data: null }
      }

      // create directory if not exists
      dirPath = path.join(defDirConf.data, '.config')
      await createDirForce(dirPath)
    }

    // Is dir not exists
    const isDirExist = await isDirExists(dirPath)
    if (isDirExist.error) {
      return { error: 1, message: 'Selected Directory not exists', data: null }
    }

    // Generate Path
    const expFileSt = await getExportFileName()
    if (expFileSt.error) {
      return expFileSt
    }

    const filename = expFileSt.data
    const filePath = path.join(dirPath, filename)

    const dir = path.dirname(filePath)
    if (!dir) {
      return { error: 1, message: 'Invalid file path', data: null }
    }

    // Exporting Configurations
    const sourcesData = await getAllDocuments(DB_SOURCE)
    const destinations = await getAllDocuments(DB_DESTINATION)
    const uploads = await getAllDocuments(DB_UPLOADS)
    const configs = await getAllDocuments(DB_CONFIG)

    // Make secure || remove passwords form sources
    const sources = sourcesData.map((source) => {
      return { ...source, password: '' }
    })

    // Convert to JSON
    const dataConf = JSON.stringify({ sources, destinations, uploads, configs }, null, 2)

    // Write to file
    await fsp.writeFile(filePath, dataConf)

    // Collect Default Destination
    const defDestination = await getDestination('default')
    if (defDestination.error) {
      return { error: 1, message: 'Default Destination not found', data: null }
    }

    // Upload to Default Destination
    const uploadSt = await backupToBucket2('', filePath, defDestination.data, 'config', false)
    if (uploadSt.error) {
      return { error: 1, message: 'Error on uploading to default destination', data: null }
    }

    return { error: 0, message: 'Data exported successfully', data: filePath }
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

const importingData = async (filePath, defDir) => {
  try {
    const fileExist = await isFileExists(filePath)
    if (fileExist.error) {
      return { error: 1, message: 'Selected file (' + filePath + ') not exists', data: null }
    }

    // Read File
    const fileData = await fsp.readFile(filePath, 'utf8')
    const jsonData = JSON.parse(fileData)
    if (!jsonData) {
      return { error: 1, message: 'Invalid Config File', data: null }
    }

    // Reset Config
    const resetSt = await resetData()
    if (resetSt.error) {
      return resetSt
    }

    // Import Sources
    for (const source of jsonData.sources || []) {
      // remove _rev
      delete source._rev
      await createDocument(DB_SOURCE, { ...sourceDataPattern, ...source })
    }

    // Import Destinations
    for (const destination of jsonData.destinations || []) {
      // remove _rev
      delete destination._rev
      await createDocument(DB_DESTINATION, { ...destinationDataPattern, ...destination })
    }

    // Import Uploads
    for (const upload of jsonData.uploads || []) {
      // remove _rev
      delete upload._rev
      await createDocument(DB_UPLOADS, { ...uploadDataPattern, ...upload })
    }

    // Import Configs
    for (const config of jsonData.configs || []) {
      // remove _rev
      delete config._rev

      if (config._id === 'default_directory') {
        if (defDir) {
          config.value = defDir
        }
      }

      await createDocument(DB_CONFIG, { ...configDataPattern, ...config })
    }

    return { error: 0, message: 'Data imported successfully', data: null }
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

module.exports = {
  getExportFileName,
  exportingData,
  importingData,
  resetData,
}
