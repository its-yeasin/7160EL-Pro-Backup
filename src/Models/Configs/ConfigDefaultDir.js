const {
  DB_CONFIG,
  getDocument,
  createDocument,
  updateDocument,
} = require('../../utils/PouchDbTools')
const { CONF_DEFAULT_DIRECTORY } = require('./ConfigKeys')

const getDefDirectory = async () => {
  try {
    // Collect Default Directory
    const confDir = await getDocument(DB_CONFIG, CONF_DEFAULT_DIRECTORY)
    if (confDir.error) {
      return { error: 1, message: 'Default Directory Not Configured', data: null }
    }

    const defaultDirectory = confDir.data.value
    if (!defaultDirectory) {
      return { error: 1, message: 'Default Directory Not Configured', data: null }
    }

    return { error: 0, message: 'Default Directory', data: defaultDirectory }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Default Directory', data: null }
  }
}

const setDefDirectory = async (defaultDirectory) => {
  try {
    // Create of Update new Line
    const confDir = await getDocument(DB_CONFIG, CONF_DEFAULT_DIRECTORY)
    if (confDir.error) {
      const createSt = await createDocument(DB_CONFIG, {
        _id: CONF_DEFAULT_DIRECTORY,
        value: defaultDirectory,
      })

      if (createSt.error) {
        return { error: 1, message: 'Error on setup Default Directory', data: null }
      }
    } else {
      const updateSt = await updateDocument(DB_CONFIG, confDir.data._id, {
        value: defaultDirectory,
      })

      if (updateSt.error) {
        return { error: 1, message: 'Error on setup Default Directory', data: null }
      }
    }

    return { error: 0, message: 'Default directory set successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

module.exports = {
  getDefDirectory,
  setDefDirectory,
}
