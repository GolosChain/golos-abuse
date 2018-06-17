const logger = require('./logger')
const bodyParser = require('body-parser')

module.exports = ({ app, port }) =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`Http server start listen on ${port} port`)
      resolve(server)
    })

    server.on('close', () => {
      logger.info(`Http server closed on ${port} port`)
    })
  })
