const { deleteDocument, DB_UPLOADS } = require('../../utils/PouchDbTools')
const { getDestination } = require('../Destinations/DestinationModel')
const { removeFile } = require('../GoogleBackup/GoogleBackup')

const deleteUpload = async (uploadInfo) => {
  try {
    // Remove Backup from remote
    const destSt = await getDestination(uploadInfo.destinationId)
    if (destSt.error) {
      return { error: 1, message: 'Destination config not found', data: null }
    }
    const destConfig = destSt.data

    if (!uploadInfo.name) {
      return { error: 1, message: 'Backup name not found', data: null }
    }

    // Remove Backup from remote
    const removeSt = await removeFile(destConfig, uploadInfo.name)
    if (removeSt.error) {
      return removeSt
    }

    // Remove from Uploads
    const delSt = await deleteDocument(DB_UPLOADS, uploadInfo._id)
    if (delSt.error) {
      return { error: 1, message: 'Error on removing backup', data: null }
    }

    return { error: 0, message: 'Backup removed successfully', data: null }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  deleteUpload,
}
