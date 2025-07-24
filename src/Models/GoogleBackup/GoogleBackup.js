var { Storage } = require('@google-cloud/storage')
var path = require('path')
var fs = require('fs')
var progress = require('progress-stream')
const isoToUnix = require('../../utils/isoToUnix')
const moment = require('moment')
const { getAppId } = require('../Configs/ConfigAppId')
const { checkOnline } = require('../../utils/IsOnline')

const backupToBucket = async (filePath, destConfig, remoteDir = 'backup', gzip = false) => {
  const fileName = path.basename(filePath) + (gzip ? '.gz' : '')
  const destination = `${remoteDir}/${fileName}`

  try {
    // Check Internet Access
    const isOnline = await checkOnline()
    if (!isOnline) {
      return { error: 1, message: 'No internet access', data: null }
    }

    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
    })

    var stat = fs.statSync(filePath)
    var str = progress({
      length: stat.size,
      time: 100 /* ms */,
    })

    str.on('progress', function (progressData) {
      console.log(Math.round(progressData.percentage) + '%')
    })

    const fileStream = fs.createReadStream(filePath)
    const bucketFile = storage.bucket(destConfig.bucket).file(destination)
    const writeStream = bucketFile.createWriteStream({ gzip })

    fileStream.pipe(str).pipe(writeStream)

    writeStream.on('finish', () => {
      console.log('Backup successful')
    })

    writeStream.on('error', (err) => {
      console.log('Backup failed', err)
    })

    return { error: 0, message: 'Backup successful', data: null }
  } catch (err) {
    throw new Error(err)
  }
}

const backupToBucket2 = async (
  sourceId,
  filePath,
  destConfig,
  remoteDir = 'backup',
  gzip = false,
) => {
  try {
    // Collect app id
    const appIdSt = await getAppId()
    const appId = appIdSt.data

    // File name & destination
    const fileName = path.basename(filePath) + (gzip ? '.gz' : '')
    const destination = `${appId}/${remoteDir}/${fileName}`

    // Check Internet Access
    const isOnline = await checkOnline()
    if (!isOnline) {
      return { error: 1, message: 'No internet access', data: null }
    }

    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
    })

    // Add metadata to the file.
    const metadata = {
      metadata: {
        appId,
        sourceId,
        destinationId: destConfig._id,
      },
    }

    const uploadSt = await storage.bucket(destConfig.bucket).upload(filePath, {
      gzip,
      destination,
      metadata,
    })

    return {
      error: 0,
      message: 'Backup successful',
      data: {
        _id: uploadSt[1].id,
        name: uploadSt[1].name,
        timeCreated: moment(uploadSt[1].timeCreated).unix(),
        timeUpdated: moment(uploadSt[1].updated).unix(),
        size: uploadSt[1].size,
        sourceId: uploadSt[1].metadata.sourceId,
        destinationId: uploadSt[1].metadata.destinationId,
      },
    }
  } catch (err) {
    throw new Error(err)
  }
}

const getFiles = async (destConfig, remoteDir = '') => {
  try {
    // Collect app id
    const appIdSt = await getAppId()
    const appId = appIdSt.data

    // Prefix
    const prefix = `${appId}/${remoteDir}`

    // Check Internet Access
    const isOnline = await checkOnline()
    if (!isOnline) {
      return { error: 1, message: 'No internet access', data: null }
    }

    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
    })

    // Find by metadata sourceId
    const [files] = await storage.bucket(destConfig.bucket).getFiles({
      prefix: prefix,
    })

    // Get all sources from the database
    //const databaseSources = await getAllDocuments(DB_SOURCE)
    const nFiles = files.map((file) => {
      const fileMetadata = file.metadata?.metadata || {}

      return {
        _id: file.id,
        name: file.name,
        timeCreated: isoToUnix(file.metadata.timeCreated),
        timeUpdated: isoToUnix(file.metadata.updated),
        size: file.metadata.size,
        sourceId: fileMetadata.sourceId || '',
        destinationId: fileMetadata.destinationId || '',
      }
    })
    // .filter((file) => {
    //   // Filter files based on available sources in the database
    //   //database sources is an array of all sources in the database
    //   return databaseSources.find((source) => source._id === file.sourceId)
    // })

    return { error: 0, message: 'List of Bucket Files', data: nFiles }
  } catch (err) {
    throw new Error(err)
  }
}

const downloadFile = async (destConfig, fileId, localPath) => {
  try {
    // Check Internet Access
    const isOnline = await checkOnline()
    if (!isOnline) {
      return { error: 1, message: 'No internet access', data: null }
    }

    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
    })

    // Download file
    const file = storage.bucket(destConfig.bucket).file(fileId)
    await file.download({ destination: localPath })

    return { error: 0, message: 'Download successful', data: null }
  } catch (err) {
    if (err.message.includes('No such object')) {
      return {
        error: 1,
        message: 'Backup not found on remote location',
        data: null,
        action: 'remove-record',
      }
    }

    throw new Error(err)
  }
}

const removeFile = async (destConfig, fileId) => {
  try {
    // Check Internet Access
    const isOnline = await checkOnline()
    if (!isOnline) {
      return { error: 1, message: 'No internet access', data: null }
    }

    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
    })

    // Delete file
    const file = storage.bucket(destConfig.bucket).file(fileId)
    await file.delete()

    return { error: 0, message: 'Backup deleted', data: null }
  } catch (err) {
    if (err.message.includes('No such object')) {
      return { error: 0, message: 'Backup already deleted', data: null }
    }

    throw new Error(err)
  }
}

const removeMultipleFiles = async (destConfig, fileIds) => {
  try {
    // Check Internet Access
    const isOnline = await checkOnline()
    if (!isOnline) {
      return { error: 1, message: 'No internet access', data: null }
    }

    const storage = new Storage({
      projectId: destConfig.projectId,
      credentials: destConfig.credentials,
    })

    const files = fileIds.map((fileId) => {
      return storage.bucket(destConfig.bucket).file(fileId)
    })

    await storage.bucket(destConfig.bucket).deleteFiles({
      files,
    })

    return { error: 0, message: 'Backups deleted', data: null }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  backupToBucket,
  backupToBucket2,
  getFiles,
  downloadFile,
  removeFile,
  removeMultipleFiles,
}
