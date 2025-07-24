let ev = null

const setEv = (event) => {
  ev = event
}

const getEv = () => {
  return ev
}

const evSendTaskStatus = (id, status) => {
  getEv()?.sender.send('task-status', { id, status })
}

const evSendDownloadProgress = (id, status) => {
  getEv()?.sender.send('download-progress', { id, status })
}

module.exports = {
  ev,
  setEv,
  getEv,
  evSendTaskStatus,
  evSendDownloadProgress
}
