const fs = require('fs')
const fsp = require('fs').promises
const moment = require('moment')
const { ncp } = require('ncp')
const path = require('path')

const removeDir = (path) => {
  return new Promise((resolve, reject) => {
    fs.rm(path, { recursive: true, force: true }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve({ error: 0, message: 'Directory removed successfully.', data: null })
      }
    })
  })
}

// await fsp.rm(tempPath, { recursive: true, force: true })

const copyDir = (source, destination) => {
  return new Promise((resolve, reject) => {
    ncp(source, destination, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve({ error: 0, message: 'Directory copied successfully.', data: null })
      }
    })
  })
}

const createDirForce = (path) => {
  return new Promise((resolve, reject) => {
    // check if directory already exists
    if (fs.existsSync(path)) {
      resolve({ error: 0, message: 'Directory already exists.', data: null })
    } else {
      fs.mkdir(path, { recursive: true }, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve({ error: 0, message: 'Directory created successfully.', data: null })
        }
      })
    }
  })
}

const getFileSizeHr = (size) => {
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

const isDirExists = (darPath) => {
  return new Promise((resolve) => {
    fs.access(darPath, fs.F_OK, (err) => {
      if (err) {
        resolve({ error: 1, message: 'Directory not exists', data: null })
      } else {
        resolve({ error: 0, message: 'Directory exists', data: null })
      }
    })
  })
}

const isFileExists = (filePath) => {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        resolve({ error: 1, message: 'File not exists', data: null })
      } else {
        resolve({ error: 0, message: 'File exists', data: null })
      }
    })
  })
}

const filesInfo = async (files = []) => {
  const fInfo = []

  try {
    for (const file of files) {
      const isFileExist = await isFileExists(file)
      if (isFileExist.error) {
        continue
      }

      const stats = await fsp.stat(file)
      fInfo.push({
        file,
        name: path.basename(file),
        created: moment(stats.birthtime).unix(),
        updated: moment(stats.mtime).unix(),
        size: stats.size,
        sizeHr: getFileSizeHr(stats.size),
      })
    }

    return fInfo
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  removeDir,
  copyDir,
  createDirForce,
  getFileSizeHr,
  isDirExists,
  isFileExists,
  filesInfo,
}
