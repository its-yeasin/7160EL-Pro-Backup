const { shell } = require('electron')

const openLink = (ev, link) => {
  shell.openExternal(link)
}

module.exports = openLink
