const { execute } = require('../Execute')

const command = 'mysql'
const dumpCommend = 'mysqldump'

const findMysqlDumpPath = async () => {
  console.log('Find Dump Path')

  try {
    const ex = await execute(`where ${dumpCommend}`)
    console.log('Ex', ex)
  } catch (err) {
    console.log('Ex', err)
    throw new Error(err)
  }
}

const testMysqlDumpPath = async (path) => {
  try {
    const ex = await execute(`${path} --version`)

    return { error: 0, message: 'Path is correct', data: ex.data.stdout }
  } catch (err) {
    throw new Error(err)
  }
}

const executeMysqlBackup = async (source) => {
  console.log('Execute Backup', source)
}

const restoreMysqlBackup = async (source) => {
  console.log('Restore Backup', source)
}

module.exports = {
  MYSQL_COMMEND: command,
  MYSQL_DUMP_COMMEND: dumpCommend,
  findMysqlDumpPath,
  testMysqlDumpPath,
  executeMysqlBackup,
  restoreMysqlBackup,
}
