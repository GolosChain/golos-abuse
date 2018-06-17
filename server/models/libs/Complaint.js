const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')

const { COMPLAINT } = require('@constants')
const postgresql = require('core/libs/postgresql')

const Model = postgresql.define(
  'complaints',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [1, 256]
      }
    },
    postId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    reason: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: { isIn: [Object.values(COMPLAINT.REASON)] }
    },
    comment: {
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
    tableName: 'complaints'
  }
)

module.exports = Model
