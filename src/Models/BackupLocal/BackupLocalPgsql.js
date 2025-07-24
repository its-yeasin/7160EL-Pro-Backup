const path = require('path')
const { generateFilePath } = require('../Configs/ConfigGenerateFs')
const { ExecutePgsql } = require('../../utils/Execute')
const { sourceTypes } = require('../Sources/SourcesData')

// const pgsqlQuery = (client, query) => {
//   return new Promise((resolve, reject) => {
//     client.query(query, (err, res) => {
//       if (err) {
//         reject(err)
//       }
//       resolve(res)
//     })
//   })
// }

const pgsqlHostBackup = async (sourceData) => {
  const database = sourceData.databaseOrPath

  if (sourceData.type !== sourceTypes.TYPE_PGSQL) {
    return { error: 0, message: 'Skipped', data: null, skipped: true }
  }

  try {
    // Step-1: Generate File Path
    const confBackupPath = await generateFilePath(sourceData)
    if (confBackupPath.error !== 0) {
      return confBackupPath
    }

    // Verify File Name
    if (!confBackupPath.data.fileName) {
      return { error: 1, message: 'Unable to generate file name', data: null }
    }

    // Verify Backup Path
    const backupPath = path.join(confBackupPath.data.defDirPath, confBackupPath.data.fileName)
    if (!backupPath) {
      return { error: 1, message: 'Error on Default Backup Path', data: null }
    }

    // Construct the pg_dump command
    const pgDumpCommand = `set "PGPASSWORD=${sourceData.password}" && pg_dump -U ${sourceData.user} -h ${sourceData.host} -d ${database} -p ${sourceData.port} > ${backupPath}`
    // console.log('pgDumpCommand', pgDumpCommand)

    // Step-2: Execute Backup
    const result = await ExecutePgsql(pgDumpCommand)
    if (result.error) {
      return result
    }

    return { error: 0, message: 'Backup successful', data: { ...result.data, backupPath } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on PostgreSQL Connection', data: null }
  }
}

module.exports = {
  pgsqlHostBackup,
}
