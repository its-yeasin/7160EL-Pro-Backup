/* eslint-disable no-undef */
const path = require('path')
const startUrl = require('./startUrl')
const { dialog } = require('electron')

let mainWindow = null

function createWindow({ BrowserWindow, shell }) {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    resizable: false,
    // titleBarStyle: 'hidden',
    // Menu will be shown by default when Menu.setApplicationMenu() is called

    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, '../preload.js'),
    },
    // resizable: false,
  })

  // startUrl() returns http://localhost:3000 or ./build/index.html (React Build File)
  mainWindow.loadURL(startUrl())

  // On Close Button Click
  mainWindow.on('close', function (event) {
    event.preventDefault() // Prevent window from closing immediately

    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: '   ',
      message:
        'When you close the window, All background process will be stopped.\nAre you sure you want to close the window?',
    }

    dialog.showMessageBox(mainWindow, options).then((result) => {
      if (result.response === 1) {
        // Do nothing, prevent window from closing
      } else {
        mainWindow.destroy() // Close the window
      }
    })
  })

  // On MiniMize Button Click
  mainWindow.on('minimize', function (event) {
    event.preventDefault()
    mainWindow.hide()
  })

  // url open
  mainWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  return mainWindow
}

// Function to reload the window
function reloadWindow() {
  // return promise
  return new Promise((resolve, reject) => {
    if (win) {
      win.reload()
      resolve({ error: 0, message: 'reloaded' })
    } else {
      reject({ error: 1, message: 'window not found' })
    }
  })
}

module.exports = { createWindow, reloadWindow, mainWindow }
