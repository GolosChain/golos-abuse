const moment = require('moment')
const Ajv = require('ajv')
const SqlString = require('sqlstring')
const HttpStatus = require('http-status-codes')

const { USER } = require('app@constants')

const app = require('../core/app')
const golos = require('../core/golos')
const logger = require('../core/logger')
const utils = require('../core/utils')
const ValidationError = require('../errors/ValidationError')
const BadRequestError = require('../errors/BadRequestError')

const regExpListOfChars = /^[a-zA-Z](,[a-zA-Z])*$/
const regExpListOfNumbers = /^\d(,\d)*$/
const regExpNumber = /^\d+$/

function getCommonWhereFilter(req) {
  const where = {}
  let { reason, username, start, end, limit, offset } = req.query
  if (!regExpNumber.test(limit)) limit = undefined
  if (!regExpNumber.test(offset)) offset = undefined
  if (!regExpNumber.test(reason)) reason = undefined
  if (!regExpNumber.test(start)) start = undefined
  if (!regExpNumber.test(end)) end = undefined

  if (reason) where.reason = reason
  if (username) where.username = { like: `${username}%` }
  if (start || end) {
    where.created = {}
    if (start) where.created['$gte'] = start
    if (end) where.created['$lt'] = end
  }

  return { where, limit, offset }
}

function commonCatchHandler(err, res) {
  if (err instanceof Ajv.ValidationError) {
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).send(new ValidationError(err.errors))
  } else if (err instanceof BadRequestError) {
    res.status(HttpStatus.BAD_REQUEST).send(err)
  } else {
    logger.log(err)
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).end()
  }
}

module.exports.create = async (req, res) => {
  const { author, permlink, comment, reason, username } = req.body

  try {
    let post = await app.models.Post.findOne({ author, permlink })
    if (!post) {
      const postFromChain = await golos.getContent({ author, permlink })

      if (!postFromChain)
        throw new BadRequestError(`Not found post with author:${author} and permlink: ${permlink}`)

      post = await app.models.Post.insert(
        {
          id: postFromChain.id,
          author: postFromChain.author,
          permlink: postFromChain.permlink,
          created: moment().unix()
        },
        { id: postFromChain.id }
      )
    }

    const data = {
      username,
      postId: post.id,
      reason,
      comment,
      created: moment().unix()
    }

    const complaint = await app.models.Complaint.insert(data, {
      username: data.username,
      postId: data.postId
    })
    res.send(complaint)
  } catch (err) {
    commonCatchHandler(err, res)
  }
}

module.exports.find = async (req, res) => {
  const { where, limit, offset } = getCommonWhereFilter(req)
  try {
    const collection = await app.models.Complaint.find({ where, limit, offset })
    res.status(HttpStatus.OK).send(collection)
  } catch (err) {
    commonCatchHandler(err, res)
  }
}

module.exports.top = async (req, res) => {
  const { where, limit, offset } = getCommonWhereFilter(req)
  const { author } = req.query
  try {
    if (author) {
      const posts = await app.models.Post.find({ where: { author }, limit })
      if (posts.length) where.postId = { in: posts.map(post => post.id) }
      else where.postId = 0
    }
    const top = await app.models.Complaint.top({ where, limit, offset })
    res.status(HttpStatus.OK).send(top)
  } catch (err) {
    commonCatchHandler(err, res)
  }
}

module.exports.slice = async (req, res) => {
  const { author, permlink } = req.query
  try {
    if (!author || !permlink)
      throw new BadRequestError(`Required fields: author(${author}), permlink(${permlink})`)

    const slice = await app.models.Complaint.slice({ author, permlink })
    res.status(HttpStatus.OK).send(slice)
  } catch (err) {
    commonCatchHandler(err, res)
  }
}
