//const exec = require('child_process').exec
//const fs = require('fs')
const path = require('path')
const { ExecuteMssql } = require('../../utils/Execute')
const mssql = require('mssql')

function getDateString() {
  const d = new Date()
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}_${('0' + d.getHours()).slice(-2)}-${('0' + d.getMinutes()).slice(-2)}-${('0' + d.getSeconds()).slice(-2)}`
}

const backupMssql = async ({ database, localDir }) => {
  try {
    // FS Operation
    const filename = `mssql_${database}_${getDateString()}.bak`

    const backupPath = path.join(localDir, filename)

    // SQL
    const sql = `BACKUP DATABASE ${database} TO DISK='${backupPath}'`

    // Command
    const command = `sqlcmd -S localhost -E -Q "${sql}"`

    // Execute
    const result = await ExecuteMssql(command)

    return { error: 0, message: 'Backup Success', data: { filename, backupPath, result } }
  } catch (err) {
    console.log(err)
  }
}

const backupMssqlHost = async (host, username, password, database, localDir) => {
  try {
    // FS Operation
    const filename = `mssql_${database}_${getDateString()}.bak`

    const backupPath = path.join(localDir, filename)

    // SQL
    const sql = `BACKUP DATABASE ${database} TO DISK='${backupPath}'`

    // SQL Connection Config
    const connection = {
      server: host,
      database: database,
      user: username,
      password: password,

      options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: true, // Trust self-signed certificate
        servername: 'server-44.bikiran.net', // Use the actual hostname here
      },
      parseJSON: true,
    }

    // SQL Connection
    const sqlConnection = await mssql.connect(connection)

    // Execute
    const result = await sqlConnection.query(sql)

    return { error: 0, message: 'Backup Success', data: { filename, backupPath, result } }
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  backupMssql,
  backupMssqlHost,
}
