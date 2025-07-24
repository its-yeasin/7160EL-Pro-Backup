const validateAll = (values = []) => {
  for (let i = 0; i < values.length; i++) {
    const data = values[i]
    if (data.error !== 0) {
      return data
    }
  }

  for (let i = 0; i < values.length; i++) {
    const data = values[i]
    if (data.error === 0 && data.skipped !== true) {
      return data
    }
  }

  return { error: 0, message: 'All Verification Passed', data: null }
}

module.exports = {
  validateAll,
}
