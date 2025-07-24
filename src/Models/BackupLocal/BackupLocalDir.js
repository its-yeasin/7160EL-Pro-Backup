const { createDirForce, copyDir, removeDir, isDirExists } = require('../../utils/FileOperation')
const { generateDirPath } = require('../Configs/ConfigGenerateFs')
const path = require('path')
const tar = require('tar')

const dirBackup = async (sourceData) => {
  const sourcePath = sourceData.databaseOrPath

  if (sourceData.type !== 'directory') {
    return { error: 0, message: 'Skipped', data: null, skipped: true }
  }

  try {
    // if directory not exists on file system
    const existSt = await isDirExists(sourcePath)
    if (existSt.error) {
      return { error: 1, message: 'Source directory not exists', data: null }
    }

    // Step-1: Generate Directory Path
    const confBackupPath = await generateDirPath(sourceData)
    if (confBackupPath.error !== 0) {
      return confBackupPath
    }

    // Verify Directory Name
    if (!confBackupPath.data.dirName) {
      return { error: 1, message: 'Unable to generate directory name', data: null }
    }

    // Step-2: Create Temp Directory
    const tempPath = path.join(confBackupPath.data.defDirPath, '.temp', confBackupPath.data.dirName)
    await createDirForce(tempPath)

    // Step-3: copy directory from source dir to temp dir
    await copyDir(sourcePath, tempPath)

    // Step-4: create tar file of temp directory
    const tarPath = path.join(confBackupPath.data.defDirPath, confBackupPath.data.dirName) + '.tar'
    await tar.create({ gzip: true, file: tarPath, cwd: path.dirname(tempPath) }, [
      confBackupPath.data.dirName,
    ])

    // Step-5: Remove temp directory
    await removeDir(tempPath)

    return { error: 0, message: 'Backup', data: { backupPath: tarPath } }
  } catch (err) {
    console.log(err)
    return { error: 1, message: err.message, data: null }
  }
}

module.exports = {
  dirBackup,
}
