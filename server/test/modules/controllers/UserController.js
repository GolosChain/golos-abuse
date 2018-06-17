const { USER } = require('@constants')

module.exports = storage => {
  const request = storage.chai.request
  const BASE_URL = storage.BASE_URL
  describe('UserController', function() {
    require('../RestController')({
      storage,
      ctrlPath: 'users',
      modelName: 'user',
      fields: ['id', 'email', 'role', 'status', 'createdAt', 'updatedAt'],
      methods: {
        create: {
          validData: { email: 'newUser@golos.com', password: 'password' },
          cases: [
            { data: { email: 'bad email' }, errors: ['password', 'email'] },
            { data: { email: 'bad email', role: 10 }, errors: ['password', 'email', 'role'] },
            {
              data: { email: 'bad email', role: 10, status: 10 },
              errors: ['password', 'email', 'role', 'status']
            },
            { data: { email: 'good@email.com', status: 10 }, errors: ['password', 'status'] }
          ]
        },
        update: {
          validData: { email: 'newUser@golos.com', password: 'new-password' },
          cases: [
            { data: { email: 'bad email' }, errors: ['email'] },
            { data: { email: 'bad email', role: 10 }, errors: ['email', 'role'] },
            {
              data: { email: 'bad email', role: 10, status: 10 },
              errors: ['email', 'role', 'status']
            },
            { data: { email: 'good@email.com', status: 10 }, errors: ['status'] }
          ]
        },
        findAll: {
          cases: [
            { filter: JSON.stringify({ where: { email: 'bad email' } }), count: 0 },
            { filter: JSON.stringify({ where: { email: 'admin@golos.com' } }), count: 1 },
            { filter: JSON.stringify({ where: { role: USER.ROLES.USER } }), count: 2 },
            { filter: JSON.stringify({ where: { role: USER.ROLES.ADMIN } }), count: 1 },
            { filter: JSON.stringify({ where: { status: USER.STATUS.ACTIVE } }), count: 3 },
            {
              filter: JSON.stringify({ where: { role: [USER.ROLES.ADMIN, USER.ROLES.USER] } }),
              count: 3
            },
            {
              filter: JSON.stringify({
                where: { email: { $like: '%golos.com' } }
              }),
              count: 3
            }
          ]
        },
        findById: {}
      }
    })
  })
}
