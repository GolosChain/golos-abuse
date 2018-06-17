const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')

const postgresql = require('core/libs/postgresql')

const Model = postgresql.define(
  'posts',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [1, 256]
      }
    },
    permlink: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [1, 256]
      }
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  },
  {
    timestamps: true,
    updatedAt: false,
    tableName: 'posts'
  }
)

module.exports = Model