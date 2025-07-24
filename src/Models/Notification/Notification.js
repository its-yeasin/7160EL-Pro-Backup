/* eslint-disable no-undef */
const { Notification } = require('electron')

const showNotification = (body, iconPath) => {
  const notification = new Notification({
    title: 'Pro Backup',
    body: iconPath,
    icon: iconPath,
  })
  notification.show()

  notification.on('click', () => {
    console.log('Notification clicked!')
  })

  // notification.on('show', () => console.log('Notification shown!'))
  // notification.on('close', () => console.log('Notification closed!'))
  // notification.on('reply', () => console.log('Notification replied!'))

  return notification
}

module.exports = { showNotification }
