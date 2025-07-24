/* eslint-disable no-undef */
const { app, BrowserWindow, ipcMain, shell, Tray, Menu, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const apiRegistry = require('./ApiRegistry')
const { setAuthToken } = require('./Api/AuthApi')
const { createWindow } = require('./utils/createWindow')
const { migrateDataDirectory } = require('./utils/DataMigration')
// const { showNotification } = require('./Models/Notification/Notification')
const path = require('path')
const { evSendDownloadProgress } = require('./Models/Tasks/Ev')
const envPath = app.isPackaged 
? path.join(process.resourcesPath, '.env')
: path.join(__dirname, '..', '.env');

require('dotenv').config({ path: envPath });


const regKeys = Object.keys(apiRegistry)
app.setAppUserModelId('com.bikiran.probackup') // Replace with your specifics
app.setAsDefaultProtocolClient('probackup'); // <-- custom protocol like myapp://

// Configure auto-updater
if (app.isPackaged) {
  autoUpdater.logger = require('electron-log');
  autoUpdater.logger.transports.file.level = 'info';
  autoUpdater.autoDownload = false; // Don't auto-download, let user choose
  
  // Configure for GitHub releases
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'its-yeasin',
    repo: '7160EL-Pro-Backup',
    private: false
  });
}

let tray = null
let win = null

app.on('ready', () => {
  // Migrate data directory on first startup
  migrateDataDirectory()

  setInterval(() => {
    evSendDownloadProgress('download', {
      percent: 50, // Example value
      status: 'downloading' // Example status
    })
  }, 1000); // for one second interval

  const iconPath = path.join(__dirname, 'assets', 'backup-pro-logo.png')

  // Create and display a tray icon
  tray = new Tray(iconPath)
  tray.setToolTip('Pro Backup')

  // Open window on tray icon click
  tray.on('click', () => {
    win.show()
  })

  // Add tray context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        win.show()
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)

  regKeys.forEach((key) => {
    ipcMain.handle(key, apiRegistry[key])
  })

  // Notification
  // showNotification('Pro Backup is running...', iconPath)

  // --Creating Window // it returns win
  win = createWindow({ BrowserWindow, shell })

  // Only check for updates in production and if app is packaged
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  } else {
    console.log('Auto-updater disabled in development mode');
  }

  // Optional: Show checking for updates message (uncomment if needed)
  // console.log(`Checking for updates. Current version ${app.getVersion()}`);

  // // Set application menu to show menubar
  // const template = [
  //   {
  //     label: 'File',
  //     submenu: [
  //       { role: 'reload' },
  //       { role: 'quit' }
  //     ]
  //   },
  //   {
  //     label: 'Edit',
  //     submenu: [
  //       { role: 'undo' },
  //       { role: 'redo' },
  //       { type: 'separator' },
  //       { role: 'cut' },
  //       { role: 'copy' },
  //       { role: 'paste' }
  //     ]
  //   },
  //   {
  //     label: 'View',
  //     submenu: [
  //       { role: 'reload' },
  //       { role: 'toggleDevTools' }
  //     ]
  //   }
  // ]
  // const menu = Menu.buildFromTemplate(template)
  // Menu.setApplicationMenu(menu)
})

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', { 
      type: 'checking', 
      message: 'Checking for updates...' 
    })
  }
})

autoUpdater.on('update-available', (info) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', { 
      type: 'available', 
      message: 'Update available. Downloading...', 
      version: info.version 
    })
  }
})

autoUpdater.on('update-not-available', (info) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', { 
      type: 'not-available', 
      message: 'App is up to date.' 
    })
  }
})

autoUpdater.on('error', (err) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', { 
      type: 'error', 
      message: 'Error in auto-updater: ' + err 
    })
  }
})

autoUpdater.on('download-progress', (progressObj) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('download-progress', {
      percent: Math.round(progressObj.percent),
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond
    })
  }
})

autoUpdater.on('update-downloaded', (info) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', { 
      type: 'downloaded', 
      message: 'Update downloaded. Will install on restart.', 
      version: info.version 
    })
  }
  // Optionally auto-restart
  // autoUpdater.quitAndInstall()
})

/*New Update Available*/
autoUpdater.on("update-available", () => {
  dialog.showMessageBox(win, {
    type: 'info',
    title: 'Update Available',
    message: 'A new version is available!',
    detail: `Current version: ${app.getVersion()}\nThe update will be downloaded in the background.`,
    buttons: ['OK', 'Download Now'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 1) {
      // User clicked "Download Now"
      autoUpdater.downloadUpdate();
    } else {
      // User clicked "OK" - download will start automatically
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on("update-not-available", () => {
  // Optionally show a dialog for "no update available" - usually not needed
  // dialog.showMessageBox(win, {
  //   type: 'info',
  //   title: 'No Updates',
  //   message: 'You are running the latest version.',
  //   detail: `Current version: ${app.getVersion()}`,
  //   buttons: ['OK']
  // });
});

/*Download Completion Message*/
autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox(win, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update downloaded successfully!',
    detail: 'The application will restart to apply the update.',
    buttons: ['Restart Now', 'Later'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 0) {
      // User clicked "Restart Now"
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on("error", (info) => {
  console.error('Auto-updater error:', info);
  
  // Handle specific errors
  if (info && info.message) {
    if (info.message.includes('404')) {
      console.log('No releases found - auto-updater disabled');
      return;
    }
    if (info.message.includes('ZIP file not provided')) {
      console.log('ZIP file issue - check build configuration for target platforms');
      return;
    }
  }
  
  // Show error dialog for other errors
  if (win) {
    dialog.showMessageBox(win, {
      type: 'warning',
      title: 'Update Check',
      message: 'Unable to check for updates',
      detail: 'Please check your internet connection and try again later.',
      buttons: ['OK']
    });
  }
});


app.on('open-url', (event, url) => {
  event.preventDefault();

  const parsedUrl = new URL(url);
  const token = parsedUrl.searchParams.get('token');

  // Now you have the token! Use it to log in or validate
  console.log('Received token from browser:', token);

  // Store the token in AuthApi
  setAuthToken(token);

  // Send token to renderer process
  if (win && token) {
    win.webContents.send('auth-token-received', token);
  }
});

