const Ajv = require('ajv')
const SqlString = require('sqlstring')
const Base = require('./Base')

const {COMPLAINT} = require('app@constants')

const app = require('../core/app')
const utils = require('../core/utils')

const ajv = new Ajv({useDefaults: true, $data: true, allErrors: true})
require('ajv-keywords')(ajv)

ajv.addKeyword('postMustExists', {
  async: true,
  validate: async (opt, data) => {
    const sql = SqlString.format('SELECT * FROM posts WHERE id = ?', [data])
    const [post] = await app.tarantool.call('sql', sql)
    return !!post.length
  }
})


ajv.addKeyword('complaintsAlreadyExists', {
  async: true,
  validate: async (opt, data, props, path, instance) => {
    const sql = SqlString.format('SELECT * FROM complaints WHERE username = ? AND postId = ?', [instance.username, instance.postId])
    const [complaint] = await app.tarantool.call('sql', sql)
    return !complaint.length
  }
})

const schema = {
  "$async": true,
  table: 'complaints',
  type: "object",
  tuple: ['id', 'username', 'postId', 'reason', 'comment', 'created'],
  properties: {
    id: {type: ['number', 'null']},
    username: {type: 'string', complaintsAlreadyExists: {}},
    postId: {type: 'number', postMustExists: {}},
    reason: {type: 'number', enum: Object.values(COMPLAINT.REASON)},
    comment: {type: 'string'},
    created: {type: 'number'}
  },
  required: [
    'username',
    'postId',
    'reason',
    'comment',
    'created'
  ]
}
const validate = ajv.compile(schema)


module.exports.find = Base.find(schema)
module.exports.findOne = Base.findOne(schema)
module.exports.insert = Base.insert(schema, validate)
module.exports.update = Base.update(schema, validate)

module.exports.top = async ({where, limit = 10, offset = 0}) => {
  where = utils.whereObjToSqlArrCondition(where, schema.table)
    .join(' AND ')

  const select = [
    `COUNT(${schema.table}.id) as sum`,
    'posts.author',
    'posts.permlink'
  ].join(',')

  const sql = [
    `SELECT ${select} FROM ${schema.table}`,
    `JOIN posts ON ${schema.table}.postId = posts.id`,
    where ? `WHERE ${where}` : '',
    'GROUP BY postId',
    'ORDER BY sum DESC',
    `LIMIT ${offset}, ${limit}`
  ].join(' ')

  const collection = await app.tarantool.call('sql', sql)
  return collection[0].length ? collection.map(item => utils.tupleToJson(item, ['count', 'author', 'permlink'])) : []
}

module.exports.slice = async ({author, permlink}) => {
  const where = utils.whereObjToSqlArrCondition({
    'posts.author': author,
    'posts.permlink': permlink
  }).join(' AND ')

  const select = [
    `COUNT(${schema.table}.id) as sum`,
    'reason'
  ].join(',')

  const sql = [
    `SELECT ${select} FROM ${schema.table}`,
    `JOIN posts ON ${schema.table}.postId = posts.id`,
    `WHERE ${where}`,
    `GROUP BY reason`,
    `ORDER BY sum ASC`
  ].join(' ')

  let collection = await app.tarantool.call('sql', sql)
  collection = collection[0].length ? collection.map(item => utils.tupleToJson(item, ['count', 'reason', 'author', 'permlink'])) : []
  return collection.reduce((obj, item) => {
    obj.sum += item.count
    obj.byReasons.push(item)
    return obj
  }, {author, permlink, sum: 0, byReasons: []})
}