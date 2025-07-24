const { exec } = require('child_process')
const path = require('path')
const os = require('os')

const isWindows = os.platform() === 'win32'

const dumpUtilities = {
  dumpPgsql: isWindows ? 'pg_dump.exe' : 'pg_dump',
  dumpMysql: isWindows ? 'mysqldump.exe' : 'mysqldump',
  dumpMssql: isWindows ? 'sqlcmd.exe' : 'sqlcmd',
}

const dumpCommands = {
  dumpPgsql: 'pg_dump',
  dumpMysql: 'mysqldump',
  dumpMssql: 'sqlcmd',
}

const replaceFileNameFromPath = (filePath, dumpType) => {
  // Cross-platform path handling
  const pathArr = filePath.split(path.sep)
  pathArr.pop()
  pathArr.push(dumpUtilities[dumpType])
  return pathArr.join(path.sep)
}

function scanDumpPathExistence(commandType, dumpType) {
  return new Promise((resolve) => {
    // Use cross-platform command to find executable
    const command = isWindows ? `where "${commandType}"` : `which ${commandType}`

    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({
          error: 1,
          message: error.message,
          data: null,
        })
        return
      }
      if (stderr) {
        resolve({
          error: 1,
          message: 'Error finding dump path',
          data: null,
        })
        return
      }
      const files = stdout.trim().split('\n')
      if (files.length > 0) {
        const dumpPath = files[0].trim()
        resolve({
          error: 0,
          message: 'Dump path found',
          data: { path: replaceFileNameFromPath(dumpPath, dumpType) },
        })
      } else {
        resolve({ error: 0, message: 'dump utility not found', data: null })
      }
    })
  })
}

const testDumpPathExistence = async (commandType) => {
  let sqlType = {}
  for (const [key, value] of Object.entries(dumpCommands)) {
    sqlType[value] = key
  }

  const sql = sqlType[commandType]?.slice(4) || 'SQL'

  return new Promise((resolve) => {
    // Use cross-platform command to find executable
    const command = isWindows ? `where "${commandType}"` : `which ${commandType}`

    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({
          error: 1,
          message: `${sql} dump path not found`,
          data: null,
        })
        return
      }
      if (stderr) {
        resolve({
          error: 1,
          message: 'Error finding dump path',
          data: null,
        })
        return
      }
      const files = stdout.trim().split('\n')
      if (files.length > 0) {
        const dumpPath = files[0].trim()
        resolve({
          error: 0,
          message: `${sql} Dump path found`,
          data: { path: dumpPath },
        })
      } else {
        resolve({ error: 0, message: 'dump utility not found', data: null })
      }
    })
  })
}

module.exports = {
  scanDumpPathExistence,
  testDumpPathExistence,
  dumpUtilities,
  dumpCommands,
  replaceFileNameFromPath,
}
