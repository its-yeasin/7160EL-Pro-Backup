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
    private: false,
    // Add these for better compatibility
    releaseType: 'release' // Only check actual releases, not pre-releases
  });
  
  // Enable auto-download after user confirmation
  autoUpdater.autoInstallOnAppQuit = false;
  
  // Disable signature verification for now to avoid code signing issues
  process.env.ELECTRON_UPDATER_ALLOW_UNSIGNED = 'true';
}

let tray = null
let win = null

app.on('ready', () => {
  // Migrate data directory on first startup
  migrateDataDirectory()

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
    // Add a delay to ensure the window is ready and check network connectivity
    setTimeout(async () => {
      try {
        console.log(`Checking for updates. Current version ${app.getVersion()}`);
        
        // Simple network check before trying to update
        const https = require('https');
        const testConnection = () => {
          return new Promise((resolve, reject) => {
            const req = https.get('https://api.github.com', { timeout: 5000 }, (res) => {
              resolve(res.statusCode === 200);
            });
            req.on('error', reject);
            req.on('timeout', () => {
              req.destroy();
              reject(new Error('Network timeout'));
            });
          });
        };
        
        const isOnline = await testConnection().catch(() => false);
        if (!isOnline) {
          console.log('Network connection not available, skipping update check');
          if (win && !win.isDestroyed()) {
            win.webContents.send('update-status', { 
              type: 'offline', 
              message: 'Network not available for update check' 
            });
          }
          return;
        }
        
        await autoUpdater.checkForUpdates();
      } catch (err) {
        console.error('Failed to check for updates:', err);
        if (win && !win.isDestroyed()) {
          win.webContents.send('update-status', { 
            type: 'error', 
            message: 'Network error: ' + err.message 
          });
        }
      }
    }, 3000); // 3 second delay
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

// Auto-updater events - Remove duplicate handlers and fix logic
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', { 
      type: 'checking', 
      message: 'Checking for updates...' 
    });
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  
  // Send initial download status
  evSendDownloadProgress('download', {
    percent: 0,
    status: 'available'
  });

  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', { 
      type: 'available', 
      message: 'Update available!', 
      version: info.version 
    });
    
    // Show dialog for update available
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available!',
      detail: `Current version: ${app.getVersion()}\nNew version: ${info.version}\nThe update will be downloaded in the background.`,
      buttons: ['Download Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        // User clicked "Download Now"
        console.log('User chose to download update');
        autoUpdater.downloadUpdate();
        
        evSendDownloadProgress('download', {
          percent: 0,
          status: 'starting'
        });
      } else {
        console.log('User chose to download later');
        // Still download in background but don't show progress
        autoUpdater.downloadUpdate();
      }
    }).catch(err => {
      console.error('Error showing update dialog:', err);
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available. Current version is latest.');
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', { 
      type: 'not-available', 
      message: 'App is up to date.' 
    });
  }
});

autoUpdater.on('error', (err) => {
  console.error('Auto-updater error:', err);
  
  // Send error status
  evSendDownloadProgress('download', {
    percent: 0,
    status: 'error',
    error: err.message
  });
  
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', { 
      type: 'error', 
      message: 'Error checking for updates: ' + err.message 
    });
  }
  
  // Handle specific errors
  if (err && err.message) {
    if (err.message.includes('404') || err.message.includes('Cannot find latest release')) {
      console.log('No releases found - make sure you have published releases on GitHub');
      return;
    }
    if (err.message.includes('ZIP file not provided')) {
      console.log('ZIP file issue - check build configuration for target platforms');
      return;
    }
    if (err.message.includes('net::ERR_INTERNET_DISCONNECTED')) {
      console.log('No internet connection');
      if (win && !win.isDestroyed()) {
        dialog.showMessageBox(win, {
          type: 'warning',
          title: 'Network Error',
          message: 'Please check your internet connection and try again later.',
          detail: 'Unable to connect to the update server.',
          buttons: ['OK']
        });
      }
      return;
    }
    if (err.message.includes('code signature') || err.message.includes('signature')) {
      console.log('Code signature validation failed - this is expected for unsigned builds');
      if (win && !win.isDestroyed()) {
        dialog.showMessageBox(win, {
          type: 'info',
          title: 'Update Available',
          message: 'A new version is available for download.',
          detail: 'Please visit our website to download the latest version manually.',
          buttons: ['Open Website', 'Later'],
          defaultId: 0,
          cancelId: 1
        }).then((result) => {
          if (result.response === 0) {
            shell.openExternal('https://github.com/its-yeasin/7160EL-Pro-Backup/releases/latest');
          }
        });
      }
      return;
    }
  }
  
  // Show error dialog for other errors only if it's a real error
  if (win && !err.message.includes('404') && !err.message.includes('signature')) {
    dialog.showMessageBox(win, {
      type: 'warning',
      title: 'Update Check Failed',
      message: 'Unable to check for updates',
      detail: 'Please check your internet connection and try again later.\n\nError: ' + err.message,
      buttons: ['OK']
    });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`Download progress: ${Math.round(progressObj.percent)}%`);
  
  // Send real download progress using evSendDownloadProgress
  evSendDownloadProgress('download', {
    percent: Math.round(progressObj.percent),
    transferred: progressObj.transferred,
    total: progressObj.total,
    bytesPerSecond: progressObj.bytesPerSecond,
    status: 'downloading'
  });

  if (win && !win.isDestroyed()) {
    win.webContents.send('download-progress', {
      percent: Math.round(progressObj.percent),
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded successfully');
  
  // Send completion status
  evSendDownloadProgress('download', {
    percent: 100,
    status: 'completed'
  });

  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', { 
      type: 'downloaded', 
      message: 'Update downloaded successfully!', 
      version: info.version 
    });
    
    // Show dialog for update completion
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded successfully!',
      detail: `Version ${info.version} is ready to install.\nThe application will restart to apply the update.`,
      buttons: ['Restart Now', 'Restart Later'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        // User clicked "Restart Now"
        console.log('User chose to restart now');
        autoUpdater.quitAndInstall();
      } else {
        console.log('User chose to restart later');
      }
    }).catch(err => {
      console.error('Error showing download complete dialog:', err);
    });
  }
});

// Add IPC handler for manual update check
ipcMain.handle('check-for-updates', async () => {
  if (app.isPackaged) {
    try {
      return await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Manual update check failed:', error);
      throw error;
    }
  } else {
    throw new Error('Updates not available in development mode');
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

