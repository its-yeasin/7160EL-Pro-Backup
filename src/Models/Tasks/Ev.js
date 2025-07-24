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

module.exports = {
  ev,
  setEv,
  getEv,
  evSendTaskStatus,
}
