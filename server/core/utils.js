const bcrypt = require('bcrypt')
const SqlString = require('sqlstring')

module.exports.hashPassword = (password) => {
  return bcrypt.hashSync('password', 10)
}

module.exports.tupleToJson = (tuple, fields) => {
  return fields.reduce((obj, key, index) => {
    obj[key] = tuple[index]
    return obj
  }, {})
}

const operators = {
  $gte: '>=',
  $gt: '>',
  $lte: '=<',
  $lt: '<',
  like: 'LIKE',
  in: 'IN'
}

module.exports.whereObjToSqlArrCondition = (where, table) => {
  return Object.keys(where).reduce((accum, key) => {
    const _key = table ? [table, key].join('.') : key
    const value = where[key]

    if (value instanceof Array) {
      accum.push(`${_key} IN (${value.map(val => SqlString.escape(val)).join(',')})`)
    } else if (value instanceof Object) {
      for (operator in value) {
        if (operator in operators) {
          if (operator === 'in') {
            const arrJoin = value[operator].map(val => SqlString.escape(val)).join(',')
            accum.push([_key, `(${arrJoin})`].join(` ${operators[operator]} `))
          } else {
            accum.push([_key, SqlString.escape(value[operator])].join(` ${operators[operator]} `))
          }
        }
      }
    } else {
      accum.push([_key, SqlString.escape(value)].join(' = '))
    }
    return accum
  }, [])
}

module.exports.setObjectToSetArray = data => {
  return Object.keys(data).reduce((arr, key) => {
    arr.push(`${key} = ${SqlString.escape(data[key])}`)
    return arr
  }, [])
}