const fs = require('fs')
const path = require('path')
const { app } = require('electron')

// Migration utility to move data from old location to new location
const migrateDataDirectory = () => {
  try {
    const newDataPath = path.join(app.getPath('userData'), 'Data')
    const newLogsPath = path.join(app.getPath('userData'), 'Logs')

    // Log platform information
    console.log('Platform:', process.platform)
    console.log('App is packaged:', app.isPackaged)
    console.log('User data path:', app.getPath('userData'))
    console.log('Target data path:', newDataPath)
    console.log('Target logs path:', newLogsPath)

    // Only migrate if app is packaged
    if (!app.isPackaged) {
      console.log('Running in development mode, skipping data migration')
      // Still ensure the development directories exist
      const devDataPath = path.resolve('Data')
      const devLogsPath = path.resolve('Logs')

      if (!fs.existsSync(devDataPath)) {
        fs.mkdirSync(devDataPath, { recursive: true })
        console.log('Created development data directory:', devDataPath)
      }

      if (!fs.existsSync(devLogsPath)) {
        fs.mkdirSync(devLogsPath, { recursive: true })
        console.log('Created development logs directory:', devLogsPath)
      }

      return false
    }

    const oldDataPath = path.resolve('Data')
    const oldLogsPath = path.resolve('Logs')

    // Ensure new data directory exists with proper permissions
    if (!fs.existsSync(newDataPath)) {
      fs.mkdirSync(newDataPath, { recursive: true, mode: 0o755 })
      console.log('Created new data directory:', newDataPath)
    }

    // Ensure new logs directory exists with proper permissions
    if (!fs.existsSync(newLogsPath)) {
      fs.mkdirSync(newLogsPath, { recursive: true, mode: 0o755 })
      console.log('Created new logs directory:', newLogsPath)
    }

    let migrationOccurred = false

    // Migrate Data directory
    if (fs.existsSync(oldDataPath)) {
      const oldFiles = fs.readdirSync(oldDataPath)
      const newFiles = fs.existsSync(newDataPath) ? fs.readdirSync(newDataPath) : []

      if (oldFiles.length > 0 && newFiles.length === 0) {
        console.log('Migrating data from old location to new location...')

        // Copy all files from old location to new location
        for (const file of oldFiles) {
          const oldFilePath = path.join(oldDataPath, file)
          const newFilePath = path.join(newDataPath, file)

          try {
            if (fs.statSync(oldFilePath).isDirectory()) {
              // Copy directory recursively
              copyDirectorySync(oldFilePath, newFilePath)
            } else {
              // Copy file
              fs.copyFileSync(oldFilePath, newFilePath)
            }
            console.log('Migrated data file:', file)
          } catch (error) {
            console.error('Error migrating data file:', file, error)
          }
        }

        console.log('Data migration completed successfully')
        migrationOccurred = true
      }
    }

    // Migrate Logs directory
    if (fs.existsSync(oldLogsPath)) {
      const oldLogFiles = fs.readdirSync(oldLogsPath)
      const newLogFiles = fs.existsSync(newLogsPath) ? fs.readdirSync(newLogsPath) : []

      if (oldLogFiles.length > 0 && newLogFiles.length === 0) {
        console.log('Migrating logs from old location to new location...')

        // Copy all log files from old location to new location
        for (const file of oldLogFiles) {
          const oldFilePath = path.join(oldLogsPath, file)
          const newFilePath = path.join(newLogsPath, file)

          try {
            if (fs.statSync(oldFilePath).isDirectory()) {
              // Copy directory recursively
              copyDirectorySync(oldFilePath, newFilePath)
            } else {
              // Copy file
              fs.copyFileSync(oldFilePath, newFilePath)
            }
            console.log('Migrated log file:', file)
          } catch (error) {
            console.error('Error migrating log file:', file, error)
          }
        }

        console.log('Logs migration completed successfully')
        migrationOccurred = true
      }
    }

    return migrationOccurred
  } catch (error) {
    console.error('Error during data migration:', error)
    return false
  }
}

// Helper function to copy directory recursively
const copyDirectorySync = (src, dest) => {
  try {
    fs.mkdirSync(dest, { recursive: true, mode: 0o755 })
    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)

      if (entry.isDirectory()) {
        copyDirectorySync(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
        // Ensure proper permissions for the copied file
        fs.chmodSync(destPath, 0o644)
      }
    }
  } catch (error) {
    console.error('Error copying directory:', error)
    throw error
  }
}

module.exports = {
  migrateDataDirectory,
}
