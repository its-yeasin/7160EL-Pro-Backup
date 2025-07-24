const { destinations } = require('../utils/DefaultValue')

const getDestinations = async () => {
  return { error: 0, message: 'Success', data: destinations }
}

const addDestination = (ev, data) => {
  console.log('addDestination data-', data)

  return { error: 0, message: 'Success', data: null }
}

const updateDestination = (ev, data) => {
  console.log('updateDestination data-', data)

  return { error: 0, message: 'Success', data: null }
}

const deleteDestination = (ev, data) => {
  console.log('deleteDestination data-', data)

  return { error: 0, message: 'Success', data: null }
}

module.exports = {
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
}
