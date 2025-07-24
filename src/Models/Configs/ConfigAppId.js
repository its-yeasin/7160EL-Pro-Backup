const { generateAppId } = require('../../utils/MyCrypto')
const { DB_CONFIG, getDocument, createDocument } = require('../../utils/PouchDbTools')
const { CONF_APP_KEY } = require('./ConfigKeys')

const fixAppId = async (appId = null) => {
  try {
    // find if appId exists
    const configSt = await getDocument(DB_CONFIG, CONF_APP_KEY)
    if (configSt.error) {
      // create new appId, silent create
      const gAppId = generateAppId()
      await createDocument(DB_CONFIG, { _id: CONF_APP_KEY, value: appId || gAppId })
    }
  } catch (err) {
    throw new Error(err)
  }
}

const getAppId = async () => {
  try {
    const configSt = await getDocument(DB_CONFIG, CONF_APP_KEY)
    if (configSt.error) {
      return { error: 1, message: 'AppId Not Found', data: null }
    }

    return { error: 0, message: 'AppId', data: configSt.data.value }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding AppId', data: null }
  }
}

module.exports = {
  fixAppId,
  getAppId,
}
