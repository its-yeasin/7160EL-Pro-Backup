const PouchDb = require('pouchdb')
const path = require('path')
const { app } = require('electron')

// Get the appropriate data directory for the app
const getDataDirectory = () => {
  if (app && app.getPath && app.isPackaged) {
    // In packaged Electron environment, use userData directory
    const dataPath = path.join(app.getPath('userData'), 'Data')
    console.log('Using packaged app data directory:', dataPath)
    return dataPath
  } else {
    // Fallback for development/non-Electron environments
    const dataPath = path.resolve('Data')
    console.log('Using development data directory:', dataPath)
    return dataPath
  }
}

// Define a function to get all documents
const getAllDocuments = (dbName) => {
  const dbPath = path.join(getDataDirectory(), dbName)
  const localDB = new PouchDb(dbPath)

  return localDB
    .allDocs({ include_docs: true })
    .then((result) => {
      // Extract and return documents from the result
      return result.rows.map((row) => row.doc)
    })
    .catch((err) => {
      console.error(err)
      throw err // Propagate the error
    })
}

const getDocument = (dbName, id) => {
  const dbPath = path.join(getDataDirectory(), dbName)
  const localDB = new PouchDb(dbPath)

  return localDB
    .get(id)
    .then((doc) => {
      return { error: 0, message: 'Success', data: doc }
    })
    .catch((err) => {
      if (err.status === 404) {
        return { error: 1, message: 'Not found on DB', data: null }
      } else {
        console.error('doc not found', err)
        throw err
      }
    })
}

// Add new Document
const createDocument = async (dbName, data) => {
  try {
    const dbPath = path.join(getDataDirectory(), dbName)
    const localDB = new PouchDb(dbPath)

    // Creating new document
    const createSt = await localDB.put(data)
    if (createSt.ok !== true) {
      return { error: 1, message: 'Error creating document', data: null }
    }

    return { error: 0, message: 'Document Created successfully', data: createSt }
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }
}

const updateDocument = async (dbName, id, data) => {
  // console.log({ dbName, id, data })
  try {
    const dbPath = path.join(getDataDirectory(), dbName)
    const localDB = new PouchDb(dbPath)

    const dataSt = await getDocument(dbName, id)
    if (dataSt.error) {
      return dataSt
    }

    // Updating the document
    const updateSt = await localDB.put({ _id: id, _rev: dataSt.data._rev, ...data })
    if (updateSt.ok !== true) {
      return { error: 1, message: 'Error updating document', data: null }
    }

    return { error: 0, message: 'Document Updated successfully', data: updateSt }
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }
}

const deleteDocument = async (dbName, id) => {
  try {
    const dbPath = path.join(getDataDirectory(), dbName)
    const localDB = new PouchDb(dbPath)

    const dataSt = await getDocument(dbName, id)
    if (dataSt.error) {
      return dataSt
    }

    // Deleting the document
    const delSt = await localDB.remove(dataSt.data)
    if (delSt.ok !== true) {
      return { error: 1, message: 'Error deleting document', data: null }
    }

    return { error: 0, message: 'Document Deleted successfully', data: delSt }
  } catch (err) {
    console.error(err)
    throw err
  }
}

const emptyDocument = async (dbName) => {
  try {
    const dbPath = path.join(getDataDirectory(), dbName)
    const localDB = new PouchDb(dbPath)

    const allDocs = await getAllDocuments(dbName)
    for (const doc of allDocs) {
      await localDB.remove(doc)
    }

    return { error: 0, message: 'Document Emptied successfully', data: null }
  } catch (err) {
    console.error(err)
    throw err
  }
}

module.exports = {
  DB_SOURCE: 'db_sources',
  DB_DESTINATION: 'db_destinations',
  DB_UPLOADS: 'db_uploads',
  DB_CONFIG: 'db_config',
  getAllDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  emptyDocument,
}
