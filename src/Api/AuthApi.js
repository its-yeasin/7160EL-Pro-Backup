const ConfigKeys = require('../Models/Configs/ConfigKeys')
const { DB_CONFIG, getDocument } = require('../utils/PouchDbTools')
const openLink = require('../utils/openLink')

const authUrl = 'https://account.bikiran.com/applogin'

// Store the auth token (this will be set from main process)
let authToken = null

const setAuthToken = (token) => {
  authToken = token
}

const getAuthToken = async () => {
  return { error: 0, message: 'Auth token retrieved', data: authToken }
}

const loginInitiate = async (ev, data) => {
  try {
    console.log(ev, data)
    // Collect AppID
    const appID = await getDocument(DB_CONFIG, ConfigKeys.CONF_APP_ID)
    console.log('AppID', appID)

    // Generate a random LoginKey
    const key =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    console.log('LoginKey', key)

    // Open the Browser Window
    openLink(`${authUrl}?appid=${appID}&key=${key}`)

    return { error: 0, message: 'Login Initiated', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on login initiation', data: null }
  }
}

module.exports = {
  loginInitiate,
  getAuthToken,
  setAuthToken,
}
