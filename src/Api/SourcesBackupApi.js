const { getDestination } = require('../Models/Destinations/DestinationModel')
const { DB_SOURCE, DB_UPLOADS, getDocument, getAllDocuments } = require('../utils/PouchDbTools')
const fs = require('fs')
const path = require('path')
const { downloadFile } = require('../Models/GoogleBackup/GoogleBackup')
const { BackupDel } = require('../Models/BackupRemote/BackupRemoteDelete')
const moment = require('moment')
const { deleteUpload } = require('../Models/Uploads/UploadsOperation')
const { createErrorLog, createSuccessLog } = require('../Models/Logs/LogCreate')

// get recent backups
const getRecentBackups = async (ev, data) => {
  try {
    const uploads = await getAllDocuments(DB_UPLOADS)
    // Collect sources
    const sources = await getAllDocuments(DB_SOURCE)
    // Filter by sourceId
    const files = uploads.filter((x) => {
      if (!data.sourceId) {
        return sources.find((y) => y._id === x.sourceId)
      }

      return x.sourceId === data.sourceId
    })
    return { error: 0, message: 'List of Backups', data: files }
  } catch (err) {
    throw new Error(err)
  }
}

const downloadBackup = async (ev, data) => {
  // data.sourceId = ''
  // data.backupId = ''
  // data.downloadPath = ''

  if (!data.sourceId) {
    return { error: 1, message: 'Source ID not found', data: null }
  }

  if (!data.backupId) {
    return { error: 1, message: 'Backup ID not found', data: null }
  }

  if (!data.downloadPath) {
    return { error: 1, message: 'Download path not found', data: null }
  }

  // Check if download path exists
  if (!fs.existsSync(data.downloadPath)) {
    return { error: 1, message: 'Download path not exists', data: null }
  }

  try {
    // Collect source configuration
    const sourceSt = await getDocument(DB_SOURCE, data.sourceId)
    if (sourceSt.error) {
      return { error: 1, message: 'Source not exists', data: null }
    }
    const sourceData = sourceSt.data

    // Collect destination configuration
    const destSt = await getDestination(sourceData.destinationId)
    if (destSt.error) {
      return { error: 1, message: 'Destination config not found', data: null }
    }
    const destConfig = destSt.data

    const idAr = data.backupId.split('/')
    idAr.shift()
    idAr.pop()
    const id = idAr.join('/')

    // Download path
    const backupId = id
    const filename = path.basename(backupId)
    const localPath = path.join(data.downloadPath, filename)

    // Download
    const downloadSt = await downloadFile(destConfig, backupId, localPath)
    if (downloadSt.error) {
      // Remove local records
      if (downloadSt.action == 'remove-record') {
        await removeBackup(ev, { backupId: data.backupId })
      }
      return downloadSt
    }

    return { error: 0, message: 'File downloaded successfully', data: { localPath } }
  } catch (err) {
    throw new Error(err)
  }
}

const removeBackup = async (ev, data) => {
  // data.backupId = ''

  if (!data.backupId) {
    return { error: 1, message: 'Backup ID not found', data: null }
  }

  try {
    // Collect Uploads Info
    const uploadFile = await getDocument(DB_UPLOADS, data.backupId)
    if (uploadFile.error) {
      return { error: 1, message: 'Backup not exists', data: null }
    }

    const deleteSt = await deleteUpload(uploadFile.data)
    if (deleteSt.error) {
      return { error: 1, message: 'Error on deleting backup', data: null }
    }

    return { error: 0, message: 'Backup removed successfully', data: deleteSt }
  } catch (err) {
    throw new Error(err)
  }
}

const cleanupBackups = async (ev, data) => {
  // data.sourceId = ''

  if (!data.sourceId) {
    return { error: 1, message: 'Source ID not found', data: null }
  }

  try {
    // Collect source configuration
    const sourceSt = await getDocument(DB_SOURCE, data.sourceId)
    if (sourceSt.error) {
      return { error: 1, message: 'Source not exists', data: null }
    }
    const sourceData = sourceSt.data

    // Collect all uploads by sourceId
    // Filter by sourceId
    const uploads = await getAllDocuments(DB_UPLOADS)
    const files = uploads
      .filter((x) => x.sourceId === data.sourceId)
      .map((x) => {
        return { ...x, date: moment.unix(x.timeCreated).format('YYYY-MM-DD') }
      })

    // Cleaning Up
    const backupDel = new BackupDel(
      sourceData.frequency,
      sourceData.backupQuantity,
      sourceData.backupRetention,
      files,
      moment().unix(),
    )

    // Find the uploads to delete
    const uploadDelIds = backupDel.deleteSelector()

    // Delete Uploads
    for (const delInfo of uploadDelIds) {
      const uploadId = delInfo.id
      const rules = delInfo.rules

      const uploadInfo = files.find((x) => x._id === uploadId)
      const deleteSt = await deleteUpload(uploadInfo)
      if (deleteSt.error) {
        createErrorLog(
          `Error on deleting backup: ${uploadId}. Rules: ${rules}. Error: ${deleteSt.message}`,
        )
      } else {
        createSuccessLog(`Backup removed successfully: ${uploadId}. Rules: ${rules}`)
      }
    }

    return { error: 0, message: 'Backups removed successfully', data: null }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  getRecentBackups,
  downloadBackup,
  removeBackup,
  cleanupBackups,
}
