const { getRecentBackups } = require('./src/Models/GoogleBackup/GoogleBackup')
const { destinations } = require('./Default/DefaultValue')
const { DB_UPLOADS, getAllDocuments, createDocument } = require('./src/utils/PouchDbTools')

const dataPattern = {
  _id: '',
  name: '',
  timeCreated: 0,
  timeUpdated: 0,
  size: 0,
  sourceId: '',
  destinationId: '',
  status: 'active', // active, deleted
}

// eslint-disable-next-line no-unused-vars
const abc = async () => {
  try {
    const files = await getRecentBackups(destinations[0], '')

    // Collect Local records of backup
    const localRec = await getAllDocuments(DB_UPLOADS)

    // Update Local records of backup
    for (const file of files.data) {
      if (localRec.find((x) => x._id === file._id)) {
        continue
      }

      // Silent create
      await createDocument(DB_UPLOADS, { ...dataPattern, ...file })
    }

    // Update Local records of backup
    // for (const rec of localRec) {
    //   if (!files.data.find((x) => x._id === rec._id)) {
    //     await updateDocument(DB_UPLOADS, rec._id, { ...rec, status: 'deleted' })
    //   }
    // }

    // Collect Local records of backup
    const localRec2 = await getAllDocuments(DB_UPLOADS)

    return { error: 0, message: 'Backup records updated', data: localRec2 }
  } catch (err) {
    console.log(err)
  }
}
