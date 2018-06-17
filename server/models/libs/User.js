const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')

const postgresql = require('core/libs/postgresql')
const { USER } = require('@constants')

const Model = postgresql.define(
  'users',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
      type: Sequelize.INTEGER,
      defaultValue: USER.ROLES.USER,
      allowNull: false,
      validate: { isIn: [Object.values(USER.ROLES)] }
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: USER.STATUS.ACTIVE,
      allowNull: false,
      validate: { isIn: [Object.values(USER.STATUS)] }
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true
    }
  },
  {
    timestamps: true,
    tableName: 'users',
    hooks: {
      beforeUpdate: (instance, options) => {
        if (instance.dataValues.password !== instance._previousDataValues.password)
          instance.password = Model.hashPassword(instance.password)
      },
      beforeCreate: (instance, options) => {
        instance.password = Model.hashPassword(instance.password)
      }
    }
  }
)

const SALT_WORK_FACTOR = 10
Model.hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR))
Model.prototype.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

const toJSON = Model.prototype.toJSON
Model.prototype.toJSON = function() {
  const attr = toJSON.call(this)
  delete attr.password
  return attr
}

module.exports = Model
