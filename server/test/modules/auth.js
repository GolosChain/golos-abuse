const {USER} = require('constants')
const async = require('async')

module.exports = STORAGE => {
  const request = STORAGE.chai.request
  const BASE_URL = STORAGE.BASE_URL
  describe('Auth ', function() {
    describe('#POST /auth', function() {
      function buildRequest(data) {
        let req = request(BASE_URL).post('/auth').set('Accept', 'application/json')
        if (data) req = req.send(data)
        return req
      }

      it('Send invalid login data, return error, status 401', function(done) {
        buildRequest({email: 'test', password: 's'})
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })

      it('Send valid login data, admin, return JWT, status 200', function(done) {
        buildRequest({email: STORAGE.data.users.admin.email, password: 'password'})
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('token')
            STORAGE.tokens.admin = res.body.token
            done()
          })
      })

      it('Send valid login data, user, return JWT, status 200', function(done) {
        buildRequest({email: STORAGE.data.users.user.email, password: 'password'})
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('token')
            STORAGE.tokens.user = res.body.token
            done()
          })
      })
    })
  })
}
