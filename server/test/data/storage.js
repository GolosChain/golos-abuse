let chai = require('chai')
let chaiHttp = require('chai-http')
chai.use(chaiHttp)
chai.should()
const config = require('../../config')
const {USER} = require('@constants')
module.exports = {
  chai: chai,
  app: null,
  BASE_URL: `http://127.0.0.1:${config.get('server:port')}`,
  tokens: {
    user: null,
    admin: null
  },
  data: {
    drafts: [],
    users: {
      user: {
        email: `user@domain.com`,
        password: 'password',
        role: USER.ROLE.USER,
        status: USER.STATUS.ACTIVE
      },
      admin: {
        email: `admin@domain.com`,
        password: 'password',
        role: USER.ROLE.ADMIN,
        status: USER.STATUS.ACTIVE
      }
    },
    userTemplate:{
      email: `%RAND%@domain.com`,
      password: 'password',
      role: USER.ROLE.USER,
      status: USER.STATUS.ACTIVE
    },
    usersCollection: []
  }
}