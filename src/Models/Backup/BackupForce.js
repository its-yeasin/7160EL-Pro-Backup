const fs = require('fs')
const path = require('path')
const moment = require('moment')
const {
  getDocument,
  createDocument,
  DB_SOURCE,
  DB_UPLOADS,
  updateDocument,
} = require('../../utils/PouchDbTools')
const { validateAll } = require('../../utils/Validate')
const { createBackupLog, createErrorLog } = require('../Logs/LogCreate')
const { getDestination } = require('../Destinations/DestinationModel')
const { mssqlWinExecBackup, mssqlHostExecBackup } = require('../BackupLocal/BackupLocalMssql')
const { dirBackup } = require('../BackupLocal/BackupLocalDir')
const { backupToBucket2 } = require('../GoogleBackup/GoogleBackup')
const { getFileSizeHr } = require('../../utils/FileOperation')
const { evSendTaskStatus } = require('../Tasks/Ev')
const { pgsqlHostBackup } = require('../BackupLocal/BackupLocalPgsql')
const { mysqlHostBackup } = require('../BackupLocal/BackupLocalMysql')

// force backup
const forceBackup = async (ev, id) => {
  evSendTaskStatus(id, 'running')
  try {
    // Message & Log
    var timeStart = moment().unix()
    createBackupLog(id, 'Backup started')

    // Step-1: Get source configuration
    const sourceSt = await getDocument(DB_SOURCE, id)
    if (sourceSt.error) {
      createBackupLog(id, 'Source not exists')
      return { error: 1, message: 'Source not exists', data: null }
    }
    const sourceData = sourceSt.data

    const destinationId = sourceData.destinationId
    if (!destinationId) {
      createBackupLog(id, 'Destination not linked')
      return { error: 1, message: 'Destination not linked', data: null }
    }

    // Step-3: Collect destination configuration
    const destSt = await getDestination(destinationId)
    if (destSt.error) {
      createBackupLog(id, 'Destination config not found')
      return { error: 1, message: 'Destination config not found', data: null }
    }
    const destConfig = destSt.data

    // Execution
    const exe1 = await mssqlWinExecBackup(sourceData)
    const exe2 = await mssqlHostExecBackup(sourceData)
    const exe3 = await pgsqlHostBackup(sourceData)
    const exe4 = await mysqlHostBackup(sourceData)
    const exe5 = await dirBackup(sourceData)

    // Step-4: Execute backup
    const backupSt = validateAll([exe1, exe2, exe3, exe4, exe5])
    if (backupSt.error) {
      evSendTaskStatus(id, 'error')
      createBackupLog(id, 'Backup failed: ' + backupSt.message)

      // Update Source Error
      await updateDocument(DB_SOURCE, id, {
        ...sourceData,
        errorStatus: true,
        errorMessage: backupSt.message,
      })
      return backupSt
    }

    if (!backupSt?.data?.backupPath) {
      evSendTaskStatus(id, 'error')
      createBackupLog(id, 'Backup path not found')
      return { error: 1, message: 'Backup path not found', data: null }
    }
    const backupPath = backupSt.data.backupPath // Important
    const basename = path.basename(sourceData.databaseOrPath)

    // Step-5: Upload to destination
    const uploadSt = await backupToBucket2(
      id,
      backupPath,
      destConfig,
      `${sourceData.type}/${basename}`,
      false,
    )
    if (uploadSt.error) {
      return backupSt
    }
    const uploadData = uploadSt.data

    // Get file size human readable
    const fileSize = fs.statSync(backupPath).size
    const fileSizeHr = getFileSizeHr(fileSize)

    // Step-6: Remove local file
    fs.unlinkSync(backupPath)

    //--Insert to local DB
    const createSt = await createDocument(DB_UPLOADS, { ...uploadData })
    if (createSt.error) {
      evSendTaskStatus(id, 'error')
      createBackupLog(id, 'Error on inserting to local DB')
      return { error: 1, message: 'Error on inserting to local DB', data: null }
    }

    // Send Message to Frontend
    // Create Log
    evSendTaskStatus(id, 'done')
    createBackupLog(
      id,
      'Backup completed after ' +
        (moment().unix() - timeStart) +
        ' seconds, File size: ' +
        fileSizeHr +
        '\n',
    )

    // Update Source, Silent update
    await updateDocument(DB_SOURCE, id, {
      ...sourceData,
      errorStatus: false,
      errorMessage: '',
      lastBackupTime: moment().unix(),
    })

    // Return
    return { error: 0, message: 'Backup successful', data: null }
  } catch (err) {
    console.log(err)
    evSendTaskStatus(id, 'error')
    createErrorLog(id + ' Error on force backup: ' + err)
    return { error: 1, message: 'Error on force backup', data: null }
  }
}

module.exports = { forceBackup }
