const { app, BrowserWindow, ipcMain, shell, Tray } = require('electron')
const process = require('process')
const apiRegistry = require('./ApiRegistry')
const { createWindow } = require('./utils/createWindow')

const regKeys = Object.keys(apiRegistry)
app.setAppUserModelId('com.bikiran.probackup') // Replace with your specifics

let tray = null
// let backgroundProcess = null;\

app
  .whenReady()
  .then(() => {
    // Create and display a tray icon
    tray = new Tray('./src/assets/backup-pro-logo.png')
    tray.setToolTip('Pro Backup')

    regKeys.forEach((key) => {
      ipcMain.handle(key, apiRegistry[key])
    })

    // --Creating Window // it returns win
    createWindow({ BrowserWindow, shell })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  .catch((err) => {
    console.log(err)
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
