const config = require('@config')
const { app, logger, golos, http, postgresql } = require('@core')

const routing = require('./routing')
const passport = require('./auth/passport')

async function main() {
  try {
    // init postgresql
    app.postgresql = postgresql
    app.models = require('@models')
    await app.postgresql.authenticate()
    const postgresqlHost = [config.get('postgresql:host'), config.get('postgresql:port')].join(':')
    logger.info(`Connected to postgresql on ${postgresqlHost}`)

    // init passport
    app.use(passport.initialize())
    
    // init golos WS
    app.golos = golos
    await golos.init()

    // init routing
    routing(app)

    // init http server
    app.server = await http({ app, port: config.get('server:port') })
  } catch (err) {
    logger.info(`Error init api, details:`, err)
    process.exit(0)
  }

  return app
}

if (require.main === module) main()

module.exports = main

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
