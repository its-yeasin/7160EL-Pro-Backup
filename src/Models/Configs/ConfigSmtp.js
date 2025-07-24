const {
  getDocument,
  DB_CONFIG,
  createDocument,
  updateDocument,
} = require('../../utils/PouchDbTools')
const { CONF_SMTP } = require('./ConfigKeys')

const getSmtpData = async () => {
  const key = CONF_SMTP

  try {
    // Get Config Data
    const configSmtpSt = await getDocument(DB_CONFIG, key)
    if (configSmtpSt.error) {
      return { error: 1, message: 'Error getting SMTP Config', data: null }
    }

    return { error: 0, message: 'SMTP Config Data', data: configSmtpSt.data }
  } catch (err) {
    console.error(err)
    return { error: 1, message: 'Error getting SMTP Config', data: null }
  }
}

const setSmtpData = async (hostname, port, username, password) => {
  const key = CONF_SMTP
  const config = {
    hostname,
    port,
    username,
    password,
    tls: true,
  }

  const smtpData = await getSmtpData()
  if (smtpData.error) {
    // Create
    const createSt = await createDocument(DB_CONFIG, { _id: key, value: config })
    if (createSt.error) {
      return { error: 1, message: 'Error setting SMTP Config', data: null }
    }

    return { error: 0, message: 'SMTP Config set successfully', data: null }
  } else {
    // Update
    const updateSt = await updateDocument(DB_CONFIG, key, { value: config })
    if (updateSt.error) {
      return { error: 1, message: 'Error setting SMTP Config', data: null }
    }

    return { error: 0, message: 'SMTP Config set successfully', data: null }
  }
}

module.exports = {
  getSmtpData,
  setSmtpData,
}
