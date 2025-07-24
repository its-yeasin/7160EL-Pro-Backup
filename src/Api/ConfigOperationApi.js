const path = require('path')
const { getDefDirectory } = require('../Models/Configs/ConfigDefaultDir')
const { getAllDocuments, DB_SOURCE } = require('../utils/PouchDbTools')
const { isDirExists, createDirForce } = require('../utils/FileOperation')
const { getTasksStatus, removeTask, restartTask, addTask } = require('../Models/Tasks/TasksModel')
const { downloadFile } = require('../Models/GoogleBackup/GoogleBackup')
const { getDestination } = require('../Models/Destinations/DestinationModel')
const { getAppId, fixAppId } = require('../Models/Configs/ConfigAppId')
const {
  exportingData,
  resetData,
  importingData,
  getExportFileName,
} = require('../Models/Maintenance/Maintenance')

const resetConfig = async () => {
  try {
    // Get AppId
    const appIdSt = await getAppId()
    const appId = appIdSt.data

    // Reset Data
    await resetData()

    // Fix AppId
    await fixAppId(appId)

    // Check if task is running
    const tasks = getTasksStatus()
    if (tasks.length > 0) {
      for (const task of tasks) {
        removeTask(task)
      }
    }
    restartTask()

    return { error: 0, message: 'Config Reset Successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

const exportConfig = async (ev, data) => {
  // data.savedPath = ''

  // Collect Sources
  try {
    const dirExist = await isDirExists(data.savedPath)
    if (dirExist.error) {
      return { error: 1, message: 'Saved Directory not exists', data: null }
    }

    // Exporting Data
    const exportSt = await exportingData(data.savedPath)
    if (exportSt.error) {
      return exportSt
    }

    return { error: 0, message: 'Config Exported Successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

const importConfig = async (ev, data) => {
  // data.configPath = ''

  if (!data.configPath) {
    return { error: 1, message: 'Config Path not found', data: null }
  }

  try {
    // importing Data
    const importSt = await importingData(data.configPath)
    if (importSt.error) {
      return importSt
    }

    // Check if task is running
    const tasks = getTasksStatus()
    if (tasks.length > 0) {
      for (const task of tasks) {
        removeTask(task)
      }
    }

    // Sources
    const sources = await getAllDocuments(DB_SOURCE)
    //--Apply Autostart
    sources.forEach((source) => {
      if (source.autostart) {
        addTask(source, false)
      }
    })
    restartTask()

    return { error: 0, message: 'Config Imported Successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

const restoreFromRemote = async (ev, data) => {
  // data.appId = ''

  if (!data.appId) {
    return { error: 1, message: 'Please Enter App Id', data: null }
  }

  try {
    const expFileSt = await getExportFileName(data.appId)
    if (expFileSt.error) {
      return expFileSt
    }
    const fileName = path.join(data.appId, 'config', expFileSt.data)

    const defDestinationConf = await getDestination('default')
    if (defDestinationConf.error) {
      return { error: 1, message: 'Default Destination not found', data: null }
    }

    // Collect Default Directory
    const defDirConf = await getDefDirectory()
    if (defDirConf.error) {
      return { error: 1, message: 'Default Directory not found', data: null }
    }
    const defDir = defDirConf.data

    // Local Path
    const localPath = path.join(defDir, '.config', path.basename(fileName))

    // create directory if not exists
    await createDirForce(path.dirname(localPath))

    // Download file from remote
    const downloadSt = await downloadFile(
      defDestinationConf.data,
      fileName.split('\\').join('/'),
      localPath,
    )
    if (downloadSt.error) {
      return downloadSt
    }

    // importing Data
    const importSt = await importingData(localPath, defDir)
    if (importSt.error) {
      return importSt
    }

    // Check if task is running
    const tasks = getTasksStatus()
    if (tasks.length > 0) {
      for (const task of tasks) {
        removeTask(task)
      }
    }

    // Sources
    const sources = await getAllDocuments(DB_SOURCE)
    //--Apply Autostart
    sources.forEach((source) => {
      if (source.autostart) {
        addTask(source, false)
      }
    })
    restartTask()

    return { error: 0, message: 'Config Imported Successfully', data: null }
  } catch (err) {
    console.log(err)
    return { error: 1, message: 'Error on finding Sources', data: null }
  }
}

module.exports = {
  resetConfig,
  exportConfig,
  importConfig,
  restoreFromRemote,
}
