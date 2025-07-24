const fs = require('fs')
const path = require('path')

// List of common installation directories for each database
const commonDirectories = {
  dumpPgsql: 'C:/Program Files/PostgreSQL',
  dumpMysql: 'C:/Program Files/MySQL',
  dumpMssql: 'C:/Program Files/Microsoft SQL Server',
}

// List of dump utility filenames for each database
const dumpUtilities = {
  dumpPgsql: 'pg_dump.exe',
  dumpMysql: 'mysqldump.exe',
  dumpMssql: 'sqlcmd.exe',
}

// Function to check if a dump file exists in a directory
function checkDumpFileExistence(baseDir, dumpUtility) {
  return new Promise((resolve) => {
    fs.readdir(baseDir, (err, files) => {
      if (err) {
        resolve({ error: 1, message: 'Error reading directory', data: null })
        return
      }

      for (const file of files) {
        const subDirPath = path.join(baseDir, file)
        const dumpFilePath = path.join(subDirPath, 'bin', dumpUtility)

        try {
          fs.accessSync(dumpFilePath, fs.constants.F_OK)
          resolve({ error: 0, message: 'Directory exists', data: null })
          return
        } catch (err) {
          if (err.code !== 'ENOENT') {
            resolve({
              error: 1,
              message: `Error checking for ${dumpFilePath}: ${err.message}`,
              data: null,
            })
            return
          }
        }
      }

      resolve({ error: 1, message: 'Directory does not exists', data: null })
    })
  })
}

module.exports = {
  checkDumpFileExistence,
  commonDirectories,
  dumpUtilities,
}

// // Check for PostgreSQL dump utility
// checkDumpFileExistence(commonDirectories.postgres, dumpUtilities.postgres);

// // Check for MySQL dump utility
// checkDumpFileExistence(commonDirectories.mysql, dumpUtilities.mysql);

// // Check for MSSQL dump utility
// checkDumpFileExistence(commonDirectories.mssql, dumpUtilities.mssql);
