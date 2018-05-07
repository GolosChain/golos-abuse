const nconf = require('nconf')
const path = require('path')

const ENV_PRODUCTION = 'production'
const ENV_DEVELOPMENT = 'development'
const ENV_TEST = 'test'


const environment = ~[ENV_PRODUCTION, ENV_DEVELOPMENT, ENV_TEST].indexOf(process.env.NODE_ENV)
  ? process.env.NODE_ENV
  : ENV_DEVELOPMENT

nconf
  .argv()
  .env()
  .file({file: path.join(__dirname, `config.${environment}.json`)})
  .defaults(require('./config.json'))

module.exports = nconf