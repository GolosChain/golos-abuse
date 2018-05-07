
const moment = require('moment')
const colors = require('colors')

function dateFormat() {
  return moment().format('YYYY-MM-DD HH:ss')
}

module.exports.log = function() {
  console.log.apply(console, [dateFormat(), process.pid, '[log]'.gray, ...arguments])
}

module.exports.info = function() {
  console.log.apply(console, [dateFormat(), process.pid, '[info]'.blue, ...arguments])
}

module.exports.error = function() {
  console.error.apply(console, [dateFormat(), process.pid, '[error]'.red, ...arguments])
}