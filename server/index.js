const config = require('./config')
const logger = require('./core/logger')

const app = require('./core/app')


const passport = require('./core/passport')
const db = require('./core/db')


async function init() {
  try {
    // Await tarantool connect
    app.tarantool = await db
    logger.info(`Tarantool conected on ${config.get('tarantool:host')}:${config.get('tarantool:port')}`)

    // init passport
    app.use(passport.initialize())


    app.models = {
      User: require('./models/User'),
      Post: require('./models/Post'),
      Complaint: require('./models/Complaint')
    }

    app.golosClient = await require('./core/golos').init()

    // Run server
    const server = require('./core/http')
    await server
    logger.info(`Http server start listen on ${config.get('server:port')} port`)

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      if (err.port === config.get('tarantool:port') && err.address == config.get('tarantool:host')) {
        logger.info(`Error init app, details: Tarantool not started`)
      }
    } else if (err.code === 'GOLOS') {
      logger.info(`Error init app, details: Golos node not connected, wrong address?`)
    } else {
      logger.info(`Error init app, details:`, err)
    }
    process.exit(0)
  }
  return app
}

if (require.main === module) {
  init()
}

module.exports = init

// Catch unhandled rejections and pretty log and safe shutdown app
process.on('unhandledRejection', err => {
  logger.error(err)
  process.exit(1)
})

process.on('message', function(msg) {
  if (msg === 'shutdown') {
    app.quit()
  }
})