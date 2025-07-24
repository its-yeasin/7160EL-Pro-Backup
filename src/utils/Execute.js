const exec = require('child_process').exec

const execute = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || stdout)
      } else {
        resolve({ error: 0, message: 'output of [exec]', data: { error, stdout, stderr } })
      }
    })
  })
}

const ExecuteMssql = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // strderr = Sqlcmd: Error: Microsoft ODBC Driver 17 for SQL Server : Login failed for user 'test_db'..
        if (stderr.includes('Login failed for user')) {
          const user = stderr.split('Login failed for user ')[1].split('..')[0]
          resolve({
            error: 1,
            message: `Login failed for user "${user}"`,
            data: { error, stdout, stderr },
          })
        }

        reject(stderr || stdout)
      } else {
        resolve({ error: 0, message: 'output of [exec]', data: { error, stdout, stderr } })
      }
    })
  })
}

const ExecutePgsql = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // pg_dump: error: connection to server at "localhost" (::1), port 5432 failed: FATAL:  password authentication failed for user "postgres"
        const message = error.message.split('\n')[1]
        if (message.includes('password authentication failed for user')) {
          // const user = command.split('-U')[1].split(' ')[0]
          const user = message.split('for user ')[1].split('"')[1]
          resolve({
            error: 1,
            message: `Password authentication failed for user "${user}"`,
            data: { error, stdout, stderr },
          })
        }

        // message = pg_dump: error: could not translate host name "localhost" to address: Unknown host
        if (message.includes('could not translate host name')) {
          const host = message.split('could not translate host name ')[1].split(' to address')[0]
          resolve({
            error: 1,
            message: `Could not translate host name "${host}" to address: Unknown host`,
            data: { error, stdout, stderr },
          })
        }

        // message = pg_dump: error: connection to server at "localhost" (::1), port 5432 failed: FATAL:  database "db_name" does not exist
        if (message.includes('database does not exist')) {
          const database = message.split('database ')[1].split(' does not exist')[0]
          resolve({
            error: 1,
            message: `Database "${database}" does not exist`,
            data: { error, stdout, stderr },
          })
        }

        // message = pg_dump: error: connection to server at "localhost" (::1), port 22 failed: Connection refused (0x0000274D/10061)
        if (message.includes('Connection refused')) {
          const port = message.split('port ')[1].split(' failed')[0]
          resolve({
            error: 1,
            message: `Connection refused on port ${port}`,
            data: { error, stdout, stderr },
          })
        }

        // message = pg_dump: error: invalid port number: "543222"
        if (message.includes('invalid port number')) {
          const port = message.split('port number: "')[1].split('"')[0]
          resolve({
            error: 1,
            message: `Invalid port number "${port}"`,
            data: { error, stdout, stderr },
          })
        }

        // message = The system cannot find the path specified.
        if (message.includes('The system cannot find the path specified')) {
          const dumpPath = command.split('&&')[1].split('>')[0].trim()
          resolve({
            error: 1,
            message: `The system cannot find the path specified: ${dumpPath}`,
            data: { error, stdout, stderr },
          })
        }

        // message = Access is denied
        if (message.includes('Access is denied')) {
          const backupPath = command.split('>')[1].trim()
          resolve({
            error: 1,
            message: `Access is denied: ${backupPath}`,
            data: { error, stdout, stderr },
          })
        }

        // message = pg_dump: error: connection to server at "localhost" (::1), port 5432 failed: FATAL:  database "sfsdfdsf" does not exist
        if (message.includes('does not exist')) {
          const database = message.split('database "')[1].split('" does not exist')[0]
          resolve({
            error: 1,
            message: `Database "${database}" does not exist`,
            data: { error, stdout, stderr },
          })
        }

        reject(stderr || stdout)
      } else {
        resolve({ error: 0, message: 'output of [exec]', data: { error, stdout, stderr } })
      }
    })
  })
}

const ExecuteMysql = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log('error +++++++++++++', error)
        console.log('stderr +++++++++++++', stderr)
        console.log('stdout +++++++++++++', stdout)

        const message = stderr

        // message = mysqldump.exe: Got error: 1045: "Access denied for user 'asdsd'@'localhost' (using password: YES)" when trying to connect
        if (message.includes('Access denied for user')) {
          const user = message.split("Access denied for user '")[1].split("'@")[0]
          const host = message.split("'@'")[1].split(' (using password: YES)')[0]
          resolve({
            error: 1,
            message: `Access denied for user '${user}@${host}' with password`,
            data: { error, stdout, stderr },
          })
        }

        // message =  mysqldump.exe: Got error: 1049: "Unknown database 'dsadsadsad'" when selecting the database
        if (message.includes('Unknown database')) {
          const database = message.split("Unknown database '")[1].split("'")[0]
          resolve({
            error: 1,
            message: `Unknown database '${database}'`,
            data: { error, stdout, stderr },
          })
        }

        reject(stderr || stdout)
      } else {
        resolve({ error: 0, message: 'output of [exec]', data: { error, stdout, stderr } })
      }
    })
  })
}

module.exports = {
  execute,
  ExecuteMssql,
  ExecutePgsql,
  ExecuteMysql,
}
