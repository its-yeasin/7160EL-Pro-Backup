module.exports = function isoToUnix(timestamp) {
  return Math.floor(new Date(timestamp).getTime() / 1000)
}
