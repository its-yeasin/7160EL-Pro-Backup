const defaultValues = require('../../utils/DefaultValue')
const { getDocument, DB_DESTINATION } = require('../../utils/PouchDbTools')

const destinationDataPattern = {
  type: '',
  title: '',
  location: '',
  projectId: '',
  credentials: {},
  bucket: '',
}

const destinationTypes = {
  DEST_GCLOUD: 'gcloud-bucket',
  // DEST_GDRIVE: 'google-drive',
  // DEST_AWS: 'aws-s3',
  // DEST_DROPBOX: 'dropbox',
}

const verifyGcloudData = (data) => {
  if (data.type !== destinationTypes.DEST_GCLOUD) {
    return { error: 0, message: 'Skipped', data: null }
  }

  if (!data.title) {
    return { error: 1, message: 'Title is required', data: null }
  }

  if (!data.bucket) {
    return { error: 1, message: 'Bucket is required', data: null }
  }

  if (!data.folder) {
    return { error: 1, message: 'Folder is required', data: null }
  }

  if (!data.accessKey) {
    return { error: 1, message: 'Access Key is required', data: null }
  }

  if (!data.secretKey) {
    return { error: 1, message: 'Secret Key is required', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
}

const getDestination = async (id) => {
  if (id === 'default' || !id) {
    // Collect Default Destination
    return { error: 0, message: 'Success', data: defaultValues.destinations[0] }
  }

  try {
    // Collect Destination by ID
    const destination = await getDocument(DB_DESTINATION, id)
    if (destination.error) {
      return { error: 1, message: 'Destination not found', data: null }
    }

    return { error: 0, message: 'Success', data: destination.data }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Destination', data: null }
  }
}

module.exports = {
  destinationDataPattern,
  destinationTypes,
  verifyGcloudData,
  getDestination,
}
