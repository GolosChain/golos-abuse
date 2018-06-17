const { USER } = require('@constants')
const moment = require('moment')

const data = {
  tokens: {
    [USER.ROLES.USER]: null,
    [USER.ROLES.ADMIN]: null
  },
  users: [
    {
      email: 'admin@golos.com',
      password: 'admin',
      role: USER.ROLES.ADMIN
    },
    {
      email: 'user@golos.com',
      password: 'user',
      role: USER.ROLES.USER
    }
  ],
  posts: [],
  complaints: []
}

module.exports.data = data

module.exports.init = async app => {
  const { User, Post, Complaint } = require('models')
  const tables = [[data.users, User], [data.complaints, Complaint], [data.posts, Post]]

  for (const [collection, Model] of tables) {
    await Model.destroy({ where: {} })
    for (const [index, attr] of collection.entries()) {
      const instance = await Model.create(attr)
      collection[index] = Object.assign(instance, collection[index])
    }
  }

  return data
}
