const { USER } = require('@constants')
module.exports = storage => {
  const request = storage.chai.request
  const BASE_URL = storage.BASE_URL

  describe('AuthController', function() {
    describe('#POST /auth', function() {
      function buildRequest(data) {
        let req = request(BASE_URL)
          .post('/auth')
          .set('Accept', 'application/json')
        if (data) req = req.send(data)
        return req
      }

      it('Send invalid login data, return error, status 401', async () => {
        const res = await buildRequest({ email: 'test', password: 's' })
        res.should.have.status(401)
      })

      storage.data.users.forEach(user => {
        const {email, password} = user
        it(`Send valid login data, ${JSON.stringify({email, password})}, return JWT, status 200`, async () => {
          const res = await buildRequest({email, password})
          res.should.have.status(200)
          res.body.should.have.property('token')
          storage.data.tokens[user.role] = res.body.token
        })
      })
    })

    describe('#GET /auth/current', function() {
      function buildRequest(token) {
        let req = request(BASE_URL)
          .get('/auth/current')
          .set('Accept', 'application/json')
        if (token) req.set('Authorization', 'Bearer ' + token)
        return req
      }

      it('Get current user without token, return error, status 401', async () => {
        const res = await buildRequest()
        res.should.have.status(401)
      })

      it('Get current user, with token, return user, status 200', async () => {
        const res = await buildRequest(storage.data.tokens[USER.ROLES.USER])
        res.should.have.status(200)
        res.body.should.have.property('id')
      })
    })

    describe('#GET /auth/refresh', function() {
      function buildRequest(token) {
        let req = request(BASE_URL)
          .get('/auth/refresh')
          .set('Accept', 'application/json')
        if (token) req.set('Authorization', 'Bearer ' + token)
        return req
      }

      it('Get refresh user without token, return error, status 401', async () => {
        const res = await buildRequest()
        res.should.have.status(401)
      })

      it('Get refresh user, with token, return token, status 200', async () => {
        const res = await buildRequest(storage.data.tokens[USER.ROLES.USER])
        res.should.have.status(200)
        res.body.should.have.property('token')
      })
    })
  })
}
