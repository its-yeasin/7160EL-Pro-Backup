/* eslint-disable no-constant-condition */
/* eslint-disable no-undef */
const url = require('url')
const process = require('process')
const path = require('path') // Import the 'path' module

const GetUrl = () => {
  const isDev = process.env.npm_lifecycle_event === 'electron'

  if (isDev) {
    return 'http://localhost:3000'
  }

  return url.format({
    pathname: path.join(__dirname, '/../../../build/index.html'),
    protocol: 'file:',
    slashes: true,
  })
}

module.exports = GetUrl
