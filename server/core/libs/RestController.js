const errors = require('restify-errors')
const Sequelize = require('sequelize')
const moment = require('moment')
const fs = require('fs')

const ValidationError = (module.exports.ValidationError = errors.makeConstructor(
  'ValidationError',
  {
    restCode: 'UnprocessableEntityError',
    statusCode: 422,
    toJSON() {
      const errs = this.jse_cause.errors.map(err => {
        return {
          message: err.message,
          field: err.path,
          code: err.validatorKey
        }
      })

      return {
        code: this.body.code,
        message: 'Invalid data',
        errors: errs
      }
    }
  }
))

module.exports.findAll = Model => async (req, res) => {
  try {
    const filter = req.query.filter || {}
    const {
      where = {},
      limit,
      offset,
      fields = null,
      order,
      include,
      attributes,
      group,
      raw = false
    } = filter

    let [count, rows] = await Promise.all([
      Model.count({
        where,
        include
      }),
      Model.findAll({
        attributes,
        where,
        limit,
        offset,
        fields,
        order,
        group,
        include,
        raw
      })
    ])

    if (count instanceof Array) count = count[0] ? count[0].count : 0

    if (attributes && !raw) {
      rows = rows.map(row => {
        for (const attr of attributes) {
          if (attr instanceof Array) {
            const field = attr[1]
            row[field] = row.get(field)
          }
        }
        return row
      })
    }
    res.send({ count, data: rows })
  } catch (err) {
    if (err instanceof SyntaxError) err = new errors.BadRequestError(err)
    else err = new errors.InternalServerError(err)

    res.status(err.statusCode)
    res.send(err)
  }
}

module.exports.findById = Model => async (req, res) => {
  try {
    const instance = await Model.findById(req.params.id)
    if (!instance) throw new errors.NotFoundError()

    res.send(instance)
  } catch (err) {
    if (!(err instanceof errors.NotFoundError)) err = new errors.InternalServerError(err)
    res.status(err.statusCode)
    res.send(err)
  }
}

module.exports.create = Model => async (req, res) => {
  try {
    const data = req.body
    const instance = await Model.create(data)
    res.send(instance)
  } catch (err) {
    if (err instanceof Sequelize.ValidationError) err = new ValidationError({ cause: err })
    else err = new errors.InternalServerError(err)
    res.status(err.statusCode)
    res.send(err)
  }
}

module.exports.deleteById = Model => async (req, res) => {
  try {
    const instance = await Model.findById(req.params.id)
    if (!instance) throw new errors.NotFoundError()
    await instance.destroy({ force: true })
    res.end()
  } catch (err) {
    if (!(err instanceof errors.NotFoundError)) err = new errors.InternalServerError(err)
    res.status(err.statusCode)
    res.send(err)
  }
}

module.exports.update = Model => async (req, res) => {
  try {
    const data = req.body
    const instance = await Model.findById(req.params.id)
    if (!instance) throw new errors.NotFoundError()

    instance.set(data)
    await instance.save({ context: { req } })
    res.send(instance)
  } catch (err) {
    if (!(err instanceof errors.NotFoundError)) {
      if (err instanceof Sequelize.ValidationError) err = new ValidationError({ cause: err })
      else err = new errors.InternalServerError(err)
    }

    res.status(err.statusCode)
    res.send(err)
  }
}
