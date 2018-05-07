const {USER} = require('app@constants')
const async = require('async')

module.exports = STORAGE => {
  const request = STORAGE.chai.request
  const BASE_URL = STORAGE.BASE_URL
  describe('Users ', function() {
    describe('#POST /users', function() {
      function buildRequest(data, token) {
        let req = request(BASE_URL).post('/users').set('Accept', 'application/json')
        if (token) req = req.set('Authorization', 'Bearer ' + token)
        if (data) req = req.send(data)
        return req
      }

      it('Try create user without permission, return error, status 401', function(done) {
        const data = {email: 'test', password: 's'}
        buildRequest(data)
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })

      it('Try create user with user permission, return error, status 401', function(done) {
        const data = {email: 'test', password: 's'}
        buildRequest(data, STORAGE.tokens.user)
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })

      it('Create invalid user, return error, status 422, have basic property', function(done) {
        const data = {email: 'test', password: 's'}
        buildRequest(data, STORAGE.tokens.admin)
          .end((err, res) => {
            res.should.have.status(422)
            res.body.details.should.have.property('email')
            res.body.details.email.keyword.should.be.eql('format')
            done()
          })
      })

      it('Create valid user, return user object, status 200', function(done) {
        const user = Object.assign({}, STORAGE.data.userTemplate)
        user.email = user.email.replace('%RAND%', Math.random().toString(36).substring(2, 15))
        user.status = USER.STATUS.BANNED
        buildRequest(user, STORAGE.tokens.admin)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('id')
            res.body.should.have.property('email')
            res.body.email.should.be.eql(user.email)
            STORAGE.data.usersCollection.push(res.body)
            done()
          })
      })

      it('Try create user again, return error, status 422, have basic property', function(done) {
        const user = Object.assign({}, STORAGE.data.usersCollection[0])
        delete user.id
        buildRequest(user, STORAGE.tokens.admin)
          .end((err, res) => {
            res.should.have.status(422)
            res.body.details.should.have.property('email')
            res.body.details.email.keyword.should.be.eql('emailExists')
            done()
          })
      })
    })

    describe('#GET /users', function() {
      function buildRequest(token, query) {

        let req = request(BASE_URL).get('/users').set('Accept', 'application/json')
        if (query) req = req.query(query)
        if (token) req = req.set('Authorization', 'Bearer ' + token)
        return req
      }

      it('Try get users without permission, return error, status 401', function(done) {
        buildRequest()
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })

      it('Try get users with user permission, return error, status 401', function(done) {
        buildRequest(STORAGE.tokens.user)
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })

      it('Get users with admin permission, return users collection, status 200', function(done) {
        buildRequest(STORAGE.tokens.admin)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.be.eql(3)
            done()
          })
      })

      it('Filter by email, return users collection[1], status 200', function(done) {
        buildRequest(STORAGE.tokens.admin, {email: STORAGE.data.users.admin.email})
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.be.eql(1)
            res.body[0].email.should.be.eql(STORAGE.data.users.admin.email)
            done()
          })
      })

      it('Filter by role, return users collection[1], status 200', function(done) {
        buildRequest(STORAGE.tokens.admin, {role: USER.ROLE.USER})
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.be.eql(2)
            res.body[0].email.should.be.eql(STORAGE.data.users.user.email)
            done()
          })
      })

      it('Filter by status, return users collection[0], status 200', function(done) {
        buildRequest(STORAGE.tokens.admin, {status: USER.STATUS.BANNED})
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.be.eql(1)
            done()
          })
      })
    })

    describe('#PUT /users/:id', function() {
      function buildRequest(data, token) {
        const user = STORAGE.data.usersCollection[0]
        let req = request(BASE_URL).put(`/users/${user.id}`).set('Accept', 'application/json')
        if (token) req = req.set('Authorization', 'Bearer ' + token)
        if (data) req = req.send(data)
        return req
      }
  
      it('Try update user without permission, return error, status 401', function(done) {
        const data = {email: 'test', password: 's'}
        buildRequest(data)
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })
  
      it('Try update user with user permission, return error, status 401', function(done) {
        const data = {email: 'test', password: 's'}
        buildRequest(data, STORAGE.tokens.user)
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })
  
      it('Update invalid user, return error, status 422, have basic property', function(done) {
        const data = {email: 'test', password: 's'}
        buildRequest(data, STORAGE.tokens.admin)
          .end((err, res) => {
            res.should.have.status(422)
            res.body.details.should.have.property('email')
            res.body.details.email.keyword.should.be.eql('format')
            done()
          })
      })
  
      it('Update valid user, return user object, status 200', function(done) {
        const data = {role: USER.ROLE.ADMIN}
        buildRequest(data, STORAGE.tokens.admin)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.role.should.be.eql(USER.ROLE.ADMIN)
            done()
          })
      })
    })
  })
}
