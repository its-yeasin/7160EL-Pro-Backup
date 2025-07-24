const defaultValues = require('../../utils/DefaultValue')
const { getFileSizeHr } = require('../../utils/FileOperation')

const sourceDataPattern = {
  type: '',
  title: '',
  host: 'localhost',
  port: 0,
  databaseOrPath: '',
  user: '',
  password: '',
  operation: '',
  destinationId: 'default', // default or destinationId
  frequency: defaultValues.frequency,
  frequencyPattern: '0 0 * * * *', // Hourly
  backupQuantity: defaultValues.backupQuantity,
  backupRetention: defaultValues.backupRetention,
  autostart: true,
  manualStop: false,
  lastBackupTime: 0,
  errorStatus: false,
  errorMessage: '',
}

const sourceTypes = {
  TYPE_MSSQL_WIN: 'mssql-win',
  TYPE_MSSQL_HOST: 'mssql-host',
  TYPE_PGSQL: 'pgsql',
  TYPE_MYSQL: 'mysql',
  TYPE_DIRECTORY: 'directory',
}

const countUploads = (sources, uploads) => {
  const uploadsCount = {}
  const uploadsFileSize = {}

  uploads.forEach((x) => {
    if (!uploadsCount[x.sourceId]) {
      uploadsCount[x.sourceId] = 0
      uploadsFileSize[x.sourceId] = 0
    }
    uploadsCount[x.sourceId]++
    uploadsFileSize[x.sourceId] += x.size
  })

  // Map with sources
  sources.forEach((x) => {
    x.uploads = uploadsCount[x._id] || 0
    x.uploadsFileSize = uploadsFileSize[x._id] || 0
  })

  sources.forEach((x) => {
    x.uploadsFileSizeHr = getFileSizeHr(x.uploadsFileSize)
  })

  return sources
}

// Export
module.exports = {
  sourceTypes,
  sourceDataPattern,
  countUploads,
}
