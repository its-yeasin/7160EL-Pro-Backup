const { testMysqlDumpPath } = require('./src/utils/Databases/Mysql')

testMysqlDumpPath('C:\\xampp\\mysql\\bin\\my2sqldump.exe')
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.log('Error22', err)
  })

// const { addSource } = require('./src/Api/SourcesApi')

// addSource(null, {
//   type: 'pgsql',
//   title: 'PostgreSQL - miracleapi',
//   host: 'localhost',
//   port: 5432,
//   databaseOrPath: 'miracleapi',
//   user: 'postgres',
//   password: 'a!23456789',
// })
//   .then((res) => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.log(err)
//   })

// const moment = require('moment')
// const { logFilesFixing } = require('./src/Models/Logs/LogOperation')

// logFilesFixing(moment().unix())
//   .then((res) => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.log(err)
//   })

// const { getLogFiles } = require('./src/Api/LogsApi')

// getLogFiles()
//   .then((res) => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.log(err)
//   })

// const { restoreFromRemote } = require('./src/Api/ConfigApi')

// restoreFromRemote(null, {})
//   .then((res) => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.log(err)
//   })

// const { cleanupBackups } = require('./src/Api/SourceBackupApi')

// cleanupBackups(null, { sourceId: '5235797dcd6aa45a76b0256a5d31b098' })
//   .then((res) => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
