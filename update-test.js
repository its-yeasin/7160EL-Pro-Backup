const { autoUpdater } = require('electron-updater');

// Test auto-updater configuration
console.log('Testing auto-updater configuration...');

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'its-yeasin',
  repo: '7160EL-Pro-Backup',
  private: false
});

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info);
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info);
});

// Check for updates
autoUpdater.checkForUpdates().catch(err => {
  console.error('Failed to check for updates:', err);
});
