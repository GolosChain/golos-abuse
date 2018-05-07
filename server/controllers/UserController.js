const moment = require('moment')
const Ajv = require('ajv')
const SqlString = require('sqlstring')
const HttpStatus = require('http-status-codes')

const {USER} = require('app@constants')

const app = require('../core/app')
const logger = require('../core/logger')
const utils = require('../core/utils')
const ValidationError = require('../errors/ValidationError')

module.exports.create = async (req, res) => {
  const data = req.body
  data.id = null
  data.created = moment().unix()
  data.password = utils.hashPassword(data.password)

  try {
    const user = await app.models.User.insert(data, {email: data.email})
    res.send(user)
  } catch (err) {
    if (err instanceof Ajv.ValidationError) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).send(new ValidationError(err.errors))
    } else {
      logger.log(err)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}

module.exports.find = async (req, res) => {
  const where = {}
  if (req.query.email) where.email = {like: `${req.query.email}%`}
  if (req.query.status) where.status = req.query.status
  if (req.query.role) where.role = req.query.role

  const {limit, offset} = req.query

  const collection = await app.models.User.find({where, limit, offset})
  res.status(HttpStatus.OK).send(collection)
}

module.exports.update = async (req, res) => {
  const data = {}
  if (req.body.password) data.password = utils.hashPassword(data.password)
  const fields = ['email', 'role', 'status']
  fields.forEach(field => {
    if (req.body[field]) data[field] = req.body[field]
  })

  try {
    const user = await app.models.User.update(req.params.id, data)
    if (user)
      res.send(user)
    else
      res.status(HttpStatus.NOT_FOUND)
  } catch (err) {
    if (err instanceof Ajv.ValidationError) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).send(new ValidationError(err.errors))
    } else {
      logger.log(err)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}