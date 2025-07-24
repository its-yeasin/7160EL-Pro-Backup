const {
  DB_CONFIG,
  getDocument,
  createDocument,
  updateDocument,
} = require('../../utils/PouchDbTools')
const { CONF_NOTIFICATION_EMAIL } = require('./ConfigKeys')

const getNotfEmail = async () => {
  try {
    // Collect Default Directory
    const confNotification = await getDocument(DB_CONFIG, CONF_NOTIFICATION_EMAIL)
    if (confNotification.error) {
      return { error: 1, message: 'Notification email Not Configured', data: null }
    }

    const email = confNotification.data.value
    if (!email) {
      return { error: 1, message: 'Notification email Not Configured', data: null }
    }

    return { error: 0, message: 'Notification email', data: email }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Notification email', data: null }
  }
}

const setNotfEmail = async (email) => {
  try {
    // Create of Update new Line
    const confNotification = await getDocument(DB_CONFIG, CONF_NOTIFICATION_EMAIL)
    if (confNotification.error) {
      const createSt = await createDocument(DB_CONFIG, {
        _id: CONF_NOTIFICATION_EMAIL,
        value: email,
      })

      if (createSt.error) {
        return { error: 1, message: 'Error on adding notification email', data: null }
      }
    } else {
      const updateSt = await updateDocument(DB_CONFIG, confNotification.data._id, {
        value: email,
      })

      if (updateSt.error) {
        return { error: 1, message: 'Error on adding notification email', data: null }
      }
    }

    return { error: 0, message: 'Notification email added successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

module.exports = {
  getNotfEmail,
  setNotfEmail,
}
