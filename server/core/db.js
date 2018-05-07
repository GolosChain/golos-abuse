const config = require('../config')
const logger = require('./logger')
const TarantoolConnection = require('tarantool-driver')
const tarantool = new TarantoolConnection(config.get('tarantool'))

module.exports = tarantool.connect().then(() => {
  tarantool.socket.on('close', () => {
    logger.info('Tarantool client closed')
  })
  return tarantool
})