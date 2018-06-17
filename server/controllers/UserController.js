const errors = require('restify-errors')
const path = require('path')
const moment = require('moment')

const { USER } = require('@constants')
const { User } = require('models')
const { RestController } = require('core')

module.exports.findAll = RestController.findAll(User)
module.exports.findById = RestController.findById(User)
module.exports.create = RestController.create(User)
module.exports.update = RestController.update(User)
