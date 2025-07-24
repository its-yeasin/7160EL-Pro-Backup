const fsp = require('fs').promises
const path = require('path')
const { filesInfo, isDirExists, isFileExists } = require('../utils/FileOperation')
const { LOG_DIR_LOCAL } = require('../Models/Logs/LogCreate')

const getLogFiles = async () => {
  try {
    // Read files with  time created
    const files = await fsp.readdir(LOG_DIR_LOCAL)
    const filesFullPath = files.map((file) => path.join(LOG_DIR_LOCAL, file))
    const fInfo = await filesInfo(filesFullPath)

    return { error: 0, message: 'List of Log Files', data: fInfo }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Log Files', data: null }
  }
}

const downloadLogFile = async (ev, data) => {
  // data.dirPath = '';
  // data.file = '';
  try {
    // check is dir exists
    const isDirExist = await isDirExists(data.dirPath)
    if (isDirExist.error) {
      return { error: 1, message: 'Directory not exists', data: null }
    }

    // check is file exists
    const isFileExist = await isFileExists(data.file)
    if (isFileExist.error) {
      return { error: 1, message: 'File not exists', data: null }
    }

    // copy file to destination
    const destFile = path.join(data.dirPath, path.basename(data.file))
    await fsp.copyFile(data.file, destFile)

    return { error: 0, message: 'File downloaded successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Log File', data: null }
  }
}

const deleteLogFile = async (ev, data) => {
  try {
    // check is file exists
    const isFileExist = await isFileExists(data.file)
    if (isFileExist.error) {
      return { error: 1, message: 'File not exists', data: null }
    }

    // delete file
    await fsp.unlink(data.file)

    return { error: 0, message: 'File deleted successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on deleting Log File', data: null }
  }
}

const emptyLogFiles = async () => {
  try {
    // Read files with  time created
    const files = await fsp.readdir(LOG_DIR_LOCAL)
    const filesFullPath = files.map((file) => path.join(LOG_DIR_LOCAL, file))
    const fInfo = await filesInfo(filesFullPath)

    // Delete files
    for (const file of fInfo) {
      await fsp.unlink(file.file)
    }

    return { error: 0, message: 'Log Files deleted successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on deleting Log Files', data: null }
  }
}

module.exports = {
  getLogFiles,
  downloadLogFile,
  deleteLogFile,
  emptyLogFiles,
}
