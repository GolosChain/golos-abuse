const app = require('../core/app')
const utils = require('../core/utils')
const SqlString = require('sqlstring')

const findOne = schema => {
  return async where => {
    const [user] = await find(schema)({where, limit: 1})
    return user || null
  }
}

const find = schema => {
  return async ({where, limit = 10, offset = 0}) => {
    where = utils.whereObjToSqlArrCondition(where)

    const sql = [
      `SELECT * FROM ${schema.table}`,
      where.length ? `WHERE ${where.join(' AND ')}` : '',
      `LIMIT ${offset}, ${limit}`
    ].join(' ')

    const collection = await app.tarantool.call('sql', sql)

    return collection[0].length ? collection.map(item => utils.tupleToJson(item, schema.tuple)) : []
  }
}


const insert = (schema, validate) => {
  return async (data, filter) => {
    await validate(data)
    const values = schema.tuple.map(field => data[field])
    let sql = SqlString.format(`INSERT INTO ${schema.table} VALUES(?)`, [values])

    const result = await app.tarantool.call('sql', sql)
    const item = await findOne(schema)(filter)
    return item
  }
}

const update = (schema, validate) => {
  return async (id, data) => {
    let item = await findOne(schema)({id})
    if (item) {
      data = Object.assign(item, data)
      await validate(data)
      const arrSet = utils.setObjectToSetArray(data)
      let sql = SqlString.format(`UPDATE ${schema.table} SET ${arrSet.join(',')} WHERE id = ?`, [id])
      const result = await app.tarantool.call('sql', sql)
      item = await findOne(schema)({id})
    }
    return item
  }
}

module.exports.find = find
module.exports.findOne = findOne
module.exports.insert = insert
module.exports.update = update
