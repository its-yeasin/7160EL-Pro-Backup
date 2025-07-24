const path = require('path')
const { generateFilePath } = require('../Configs/ConfigGenerateFs')
const { ExecuteMysql } = require('../../utils/Execute')
const { sourceTypes } = require('../Sources/SourcesData')

const mysqlHostBackup = async (sourceData) => {
  const database = sourceData.databaseOrPath

  if (sourceData.type !== sourceTypes.TYPE_MYSQL) {
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

    // Construct the mysqldump command with password
    const mysqlDumpCommand = `mysqldump -u ${sourceData.user} -h ${sourceData.host} -p${sourceData.password} ${database} > ${backupPath}`

    // Step-2: Execute Backup
    const result = await ExecuteMysql(mysqlDumpCommand)
    if (result.error) {
      return result
    }

    return { error: 0, message: 'Backup successful', data: { ...result.data, backupPath } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on MySQL Connection', data: null }
  }
}

module.exports = {
  mysqlHostBackup,
}
