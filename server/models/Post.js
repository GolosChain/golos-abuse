const Ajv = require('ajv')

const app = require('../core/app')
const utils = require('../core/utils')
const Base = require('./Base')

const ajv = new Ajv({useDefaults: true, $data: true, allErrors: true})
require('ajv-keywords')(ajv)

const schema = {
  "$async": true,
  table: 'posts',
  type: "object",
  tuple: ['id', 'author', 'permlink', 'created'],
  properties: {
    id: {type: ['number', 'null']},
    author: {type: 'string'},
    permlink: {type: 'string'},
    created: {type: 'number'}
  },
  required: [
    'id',
    'author',
    'permlink',
    'created'
  ]
}
const validate = ajv.compile(schema)

module.exports.find = Base.find(schema)
module.exports.findOne = Base.findOne(schema)
module.exports.insert = Base.insert(schema, validate)
module.exports.update = Base.update(schema, validate)