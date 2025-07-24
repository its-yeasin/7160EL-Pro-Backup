const mssql = require('mssql')
const { sourceTypes } = require('./SourcesData')

const validateType = (data) => {
  const nTypes = Object.values(sourceTypes)
  if (!nTypes.includes(data.type)) {
    return { error: 1, message: 'Type is not valid', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
}

const validateMssqlWin = (dbName) => {
  // mssql find db name, windows authentication
  const config = {
    server: 'localhost',
    database: dbName,
    options: {
      trustedConnection: true,
    },
  }

  return new Promise((resolve, reject) => {
    mssql.connect(config, (err) => {
      if (err) {
        reject('Error connecting to the database')
      } else {
        resolve({ error: 0, message: 'Connection to the database successful', data: null })
      }
    })
  })
}

const validateMssqlWinData = (data) => {
  if (data.type !== sourceTypes.TYPE_MSSQL_WIN) {
    return { error: 0, message: 'Skipped', data: null }
  }

  if (!data.host) {
    return { error: 1, message: 'Host is required', data: null }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Database is required', data: null }
  }

  if (!data.operation) {
    return { error: 1, message: 'Operation is required', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
}

const validateMssqlHostData = (data) => {
  if (data.type !== sourceTypes.TYPE_MSSQL_HOST) {
    return { error: 0, message: 'Skipped', data: null }
  }

  if (!data.host) {
    return { error: 1, message: 'Host is required', data: null }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Database is required', data: null }
  }

  if (!data.user) {
    return { error: 1, message: 'User is required', data: null }
  }

  if (!data.password) {
    return { error: 1, message: 'Password is required', data: null }
  }

  if (!data.operation) {
    return { error: 1, message: 'Operation is required', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
}

const validatePgsqlData = (data) => {
  if (data.type !== sourceTypes.TYPE_PGSQL) {
    return { error: 0, message: 'Skipped', data: null }
  }

  if (!data.host) {
    return { error: 1, message: 'Host is required', data: null }
  }

  if (!data.port) {
    return { error: 1, message: 'Port is required', data: null }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Database is required', data: null }
  }

  if (!data.user) {
    return { error: 1, message: 'User is required', data: null }
  }

  if (!data.password) {
    return { error: 1, message: 'Password is required', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
}

const validateDirectory = (data) => {
  if (data.type !== sourceTypes.TYPE_DIRECTORY) {
    return { error: 0, message: 'Skipped', data: null }
  }

  if (!data.databaseOrPath) {
    return { error: 1, message: 'Path is required', data: null }
  }

  return { error: 0, message: 'Data is valid', data: null }
}

module.exports = {
  validateType,
  validateMssqlWin,
  validateMssqlWinData,
  validateMssqlHostData,
  validatePgsqlData,
  validateDirectory,
}
