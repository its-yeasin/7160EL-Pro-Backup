const { generateFilePath } = require('../Configs/ConfigGenerateFs')
const path = require('path')
const { ExecuteMssql } = require('../../utils/Execute')

const mssqlWinExecBackup = async (sourceData) => {
  const database = sourceData.databaseOrPath

  if (sourceData.type !== 'mssql-win' || sourceData.operation !== 'exec') {
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

    // SQL for MsSQL
    const sql = `BACKUP DATABASE ${database} TO DISK='${backupPath}'`

    // Command
    const command = `sqlcmd -S localhost -E -Q "${sql}"`

    // Step-2: Execute Backup
    const result = await ExecuteMssql(command)
    if (result.error) {
      return result
    }
    const stdout = result?.data?.stdout || ''

    // Check if error
    if (stdout.includes('BACKUP DATABASE is terminating abnormally')) {
      const msg =
        stdout.split('\n')[1]?.replace('\r', '') || 'BACKUP DATABASE is terminating abnormally'
      return { error: 1, message: msg, data: null }
    }

    // Check if error
    if (stdout.includes('Incorrect syntax near the keyword')) {
      const msg = stdout.split('\n')[1]?.replace('\r', '') || 'Incorrect syntax near the keyword'
      return { error: 1, message: msg, data: null }
    }

    return { error: 0, message: 'Backup', data: { ...result.data, backupPath } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on MsSQL Connection', data: null }
  }
}

const mssqlHostExecBackup = async (sourceData) => {
  const database = sourceData.databaseOrPath

  if (sourceData.type !== 'mssql-host' || sourceData.operation !== 'exec') {
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

    // SQL for MsSQL
    const sql = `BACKUP DATABASE ${database} TO DISK='${backupPath}'`

    // Command
    const command = `sqlcmd -S ${sourceData.host} -U ${sourceData.user} -P ${sourceData.password} -Q "${sql}"`

    // Step-2: Execute Backup
    const result = await ExecuteMssql(command)
    if (result.error) {
      return result
    }
    const stdout = result?.data?.stdout || ''

    // Check if error
    if (stdout.includes('BACKUP DATABASE is terminating abnormally')) {
      const msg =
        stdout.split('\n')[1]?.replace('\r', '') || 'BACKUP DATABASE is terminating abnormally'
      return { error: 1, message: msg, data: null }
    }

    // Check if error
    if (stdout.includes('Incorrect syntax near the keyword')) {
      const msg = stdout.split('\n')[1]?.replace('\r', '') || 'Incorrect syntax near the keyword'
      return { error: 1, message: msg, data: null }
    }

    return { error: 0, message: 'Backup', data: { ...result.data, backupPath } }
  } catch (err) {
    return { error: 1, message: 'Error on MsSQL Connection', data: null }
  }
}

module.exports = {
  mssqlWinExecBackup,
  mssqlHostExecBackup,
}
