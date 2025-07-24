const syncBackup = (ev, data) => {
  console.log('sync payload data', data)

  return { error: 0, message: 'Backup sync successful', data: null }
}

module.exports = { syncBackup }
