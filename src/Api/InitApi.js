const { fixAppId, getAppId } = require('../Models/Configs/ConfigAppId')
const { createErrorLog } = require('../Models/Logs/LogCreate')
const { setEv } = require('../Models/Tasks/Ev')
const { addTask, restartTask } = require('../Models/Tasks/TasksModel')
const { getAllDocuments, DB_SOURCE } = require('../utils/PouchDbTools')

let isInit = false

const fetchInt = () => {
  const oVal = isInit
  isInit = true

  return oVal
}

const init = async (ev) => {
  if (!fetchInt()) {
    // EV
    setEv(ev)

    try {
      // AppID
      await fixAppId()
      const appId = await getAppId()

      // Sources
      const sources = await getAllDocuments(DB_SOURCE)

      //--Apply Autostart
      sources.forEach((source) => {
        if (source.autostart) {
          addTask(source, false)
        }
      })

      restartTask()

      return {
        error: 0,
        message: 'Application Init Success',
        data: {
          appId: appId.data,
          portsDb: {
            // Database Ports
            mysql: 3306,
            pgsql: 5432,
            mssql: 1433,
            oracle: 1521,
            mongo: 27017,
            couch: 5984,
            redis: 6379,
          },
          dumpPath: {
            // Database Dump Path
            mysql: 'mysqldump',
            pgsql: 'pg_dump',
            mssql: 'sqlcmd',
            oracle: 'exp',
            mongo: 'mongodump',
            couch: 'couchdb',
            redis: 'redis-cli',
          },
        },
      }
    } catch (err) {
      console.log(err)
      createErrorLog('Init Error: ' + JSON.stringify(err))
      return { error: 1, message: 'Init Error', data: null }
    }
  }
}

module.exports = {
  init,
}

/*
'cassandra': 9042,
'neo4j': 7687,
'elasticsearch': 9200,
'kafka': 9092,
'rabbitmq': 5672,
'activemq': 61616,
'mqtt': 1883,
'zookeeper': 2181,
'hadoop': 9000,
'spark': 7077,
'flink': 6123,
'kubernetes': 6443,
'docker': 2375,
'jenkins': 8080,
'gitlab': 80,
'sonarqube': 9000,
'nexus': 8081,
'artifactory': 8081,
'harbor': 80,
'minio': 9000,
*/
