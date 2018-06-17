const express = require('express')
const bodyParser = require('body-parser')

const logger = require('./logger')

const app = express()
app.use(bodyParser.json())

app.quit = cb => {
  if (app.server) app.server.close()
  if (app.postgresql) app.postgresql.close()
  if (app.golos) app.golos.close()
}

process.on('unhandledRejection', err => {
  logger.error(err)
  process.exit(1)
})

process.on('message', msg => {
  if (msg === 'shutdown') app.quit()
})

module.exports = app
