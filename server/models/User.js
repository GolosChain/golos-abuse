const Ajv = require('ajv')
const SqlString = require('sqlstring')

const {USER} = require('app@constants')

const app = require('../core/app')
const Base = require('./Base')

const ajv = new Ajv({useDefaults: true, $data: true, allErrors: true})
require('ajv-keywords')(ajv)

ajv.addKeyword('emailExists', {
  async: true,
  validate: async (opt, data) => {
    const sql = SqlString.format('SELECT * FROM users WHERE email = ?', [data])
    const [user] = await app.tarantool.call('sql', sql)
    return !user.length
  }
})

const schema = {
  "$async": true,
  type: "object",
  table: 'users',
  tuple: ['id', 'email', 'password', 'role', 'status', 'created'],
  properties: {
    id: {type: ['number', 'null']},
    email: {
      type: 'string',
      format: 'email'
    },
    password: {type: 'string'},
    role: {type: 'number', enum: Object.values(USER.ROLE)},
    status: {type: 'number', enum: Object.values(USER.STATUS)},
    created: {type: 'number'}
  },
  required: [
    'email',
    'password',
    'role',
    'status',
    'created'
  ],
  switch: [
    {
      if: {
        properties: {
          id: {type: 'null'}
        }
      },
      then: {
        properties: {
          email: {emailExists: {}}
        }
      },
    }
  ]
}
const validate = ajv.compile(schema)

module.exports.find = Base.find(schema)
module.exports.findOne = Base.findOne(schema)
module.exports.insert = Base.insert(schema, validate)
module.exports.update = Base.update(schema, validate)
