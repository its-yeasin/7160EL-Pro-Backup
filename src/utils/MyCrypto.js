const crypto = require('crypto')

const md5 = (string) => {
  return crypto.createHash('md5').update(string).digest('hex')
}

const generateAppId = () => {
  const str =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return md5(str)
}

const generateHash = () => {
  const randString =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return crypto.createHash('md5').update(randString).digest('hex')
}

module.exports = {
  md5,
  generateAppId,
  generateHash,
}
