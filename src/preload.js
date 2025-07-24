const electron = require('electron')

// Check if ipcRenderer is available
if (electron && electron.ipcRenderer) {
  const { contextBridge, ipcRenderer } = electron

  const apiRegistry = require('./ApiRegistry')
  const obj = {}

  const keys = Object.keys(apiRegistry)
  keys.forEach((key) => {
    // Sender
    obj[key] = (data) => ipcRenderer.invoke(key, data)
  })

  // Message Sender
  obj.messageOn = (id, fn) => ipcRenderer.on(id, fn)
  obj.messageOff = (id) => ipcRenderer.removeAllListeners(id)
  
  // Download Progress Handler
  obj.onDownloadProgress = (callback) => ipcRenderer.on('download-progress', callback)
  obj.offDownloadProgress = () => ipcRenderer.removeAllListeners('download-progress')
  
  // Update Status Handler
  obj.onUpdateStatus = (callback) => ipcRenderer.on('update-status', callback)
  obj.offUpdateStatus = () => ipcRenderer.removeAllListeners('update-status')

  contextBridge.exposeInMainWorld('electronAPI', obj)
} else {
  console.error('ipcRenderer is not available')
}
