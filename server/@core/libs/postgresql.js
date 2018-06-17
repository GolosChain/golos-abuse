const Sequelize = require('sequelize')
const config = require('@config')
const { logger } = require('@core')

const Op = Sequelize.Op
const { database, username, password, port = 5432, host = '127.0.0.1' } = config.get('postgresql')

const sequelize = new Sequelize(database, username, password, {
  dialect: 'postgres',
  // timezone: config.get('tz'),
  pool: {
    max: 50,
    min: 0,
    idle: 20000,
    acquire: 40000,
    evict: 20000
  },
  operatorsAliases: {
    $between: Op.between,
    $and: Op.and,
    $or: Op.or,
    $like: Op.like,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in
  },
  logging: !!process.env.DEBUG
})

module.exports = sequelize
