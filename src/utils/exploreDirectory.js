const { exec } = require('child_process')
const os = require('os')

// Open file explorer function
const exploreDirectory = (ev, directoryPath) => {
  let command

  if (os.platform() === 'linux') {
    command = `xdg-open "${directoryPath}"`
  } else if (os.platform() === 'darwin') {
    command = `open "${directoryPath}"`
  } else if (os.platform() === 'win32') {
    command = `start "" "${directoryPath}"`
  } else {
    return {
      error: 1,
      message: 'Unsupported operating system',
      data: null,
    }
  }

  exec(command, (err) => {
    if (err) {
      return {
        error: 1,
        message: 'Error on opening directory',
        data: null,
      }
    }

    return {
      error: 0,
      message: 'Directory opened',
      data: null,
    }
  })
}

module.exports = exploreDirectory
