const fsp = require('fs').promises
const path = require('path')
const moment = require('moment')
const { filesInfo } = require('../../utils/FileOperation')
const { LOG_DIR_LOCAL, LOG_DIR_REMOTE, createErrorLog, createSuccessLog } = require('./LogCreate')
const { getFiles, backupToBucket2, removeFile } = require('../GoogleBackup/GoogleBackup')
const { getDestination } = require('../Destinations/DestinationModel')
const { logLocalRetainDays, logRemoteRetainDays } = require('../../utils/DefaultValue')

const logFilesFixing = async (timeNow) => {
  const thisHour = moment().format('YYYY_MM_DD_HH')

  try {
    // 1. Read all logs form logs folder
    // Read files with  time created
    const files = await fsp.readdir(LOG_DIR_LOCAL)
    const filesFullPath = files.map((file) => path.join(LOG_DIR_LOCAL, file))
    let fInfo = await filesInfo(filesFullPath)

    // Filter files except create the running hour
    fInfo = fInfo.filter((file) => {
      const createdHour = moment.unix(file.created).format('YYYY_MM_DD_HH')
      return createdHour !== thisHour
    })

    // Remove all Log Files that are older than 10 days
    const oldest = timeNow - logLocalRetainDays * 24 * 60 * 60
    const oldFiles = fInfo.filter((file) => file.created < oldest) // For Delete Operation
    const newFiles = fInfo.filter((file) => file.created >= oldest) // For Remote Upload Operation

    //--Collect Default Destination Configuration
    const destConfig = await getDestination('default')
    if (destConfig.error) {
      return { error: 1, message: 'Default Destination not found', data: null }
    }

    // Collect Remote Files From Google Bucket
    const remoteFilesSt = await getFiles(destConfig.data, LOG_DIR_REMOTE)
    if (remoteFilesSt.error) {
      return { error: 1, message: 'Error on getting remote files', data: null }
    }

    // List of remote files
    const remoteFiles = remoteFilesSt.data.map((file) => {
      return { ...file, fileName: path.basename(file.name) }
    })

    // Filter oldest remote files for delete operation
    const oldestRemote = timeNow - logRemoteRetainDays * 24 * 60 * 60
    const remoteFilesToDelete = remoteFiles.filter((file) => file.timeCreated < oldestRemote)

    // Filter non-existing files in the remote
    const nonExistingFiles = newFiles.filter((file) => {
      return !remoteFiles.find((rFile) => rFile.fileName === file.name)
    })

    // Upload non existing files to the remote
    for (const file of nonExistingFiles) {
      const fileFullPath = path.join(LOG_DIR_LOCAL, file.name)
      const uploadSt = await backupToBucket2('', fileFullPath, destConfig.data, LOG_DIR_REMOTE)
      if (uploadSt.error) {
        createErrorLog(`Error on uploading file ${file.name} to remote`)
      }
      createSuccessLog('Log file uploaded successfully. File: ' + file.name)
    }

    // Remove Local Files && Local Delete Operation
    for (const file of oldFiles) {
      await fsp.unlink(file.file)
      createSuccessLog('Local Log file deleted successfully. File: ' + file.file)
    }

    // Remove Remote Files && Remote Delete Operation
    for (const file of remoteFilesToDelete) {
      const deleteSt = await removeFile(destConfig.data, file.name)
      if (deleteSt.error) {
        createErrorLog(`Error on deleting file ${file.name} from remote`)
      }
      createSuccessLog('Remote Log file deleted successfully. File: ' + file.name)
    }

    return { error: 0, message: 'Log files fixed successfully', data: null }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  logFilesFixing,
}
