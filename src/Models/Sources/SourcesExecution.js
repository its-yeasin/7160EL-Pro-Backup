const mssql = require('mssql')
const path = require('path')
const { generateFilePath } = require('../Configs/ConfigGenerateFs')

const mssqlWinConnect = async (data) => {
  const database = data.databaseOrPath

  if (data.type !== 'mssql-win' || data.operation !== 'mssql-connection') {
    return { error: 0, message: 'Skipped', data: null, skipped: true }
  }

  try {
    const confBackupPath = await generateFilePath(data)
    if (confBackupPath.error !== 0) {
      return confBackupPath
    }

    if (!confBackupPath.data.fileName) {
      return { error: 1, message: 'Unable to generate file name', data: null }
    }

    const backupPath = path.join(confBackupPath.data.defDirPath, confBackupPath.data.fileName)
    if (!backupPath) {
      return { error: 1, message: 'Error on Default Backup Path', data: null }
    }

    mssql.connect({
      server: 'localhost',
      database: database,
      options: {
        trustedConnection: true,
      },
    })

    const pool = await mssql.connect()
    const result = await pool.request().query('SELECT 1')

    return { error: 0, message: 'Connected', data: { ...result, backupPath } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on MsSQL Connection', data: null }
  }
}

const mssqlWinDemo = async (data) => {
  //const database = data.databaseOrPath

  if (data.type !== 'mssql-win' || data.operation !== 'mssql-demo') {
    return { error: 0, message: 'Skipped', data: null }
  }

  return { error: 0, message: 'Demo', data: null }
}

module.exports = {
  mssqlWinConnect,
  mssqlWinDemo,
}
