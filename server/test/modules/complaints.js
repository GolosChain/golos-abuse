const config = require('../../config')
const moment = require('moment')
const {COMPLAINT} = require('app@constants')
const async = require('async')
const {Signature} = require('steem/lib/auth/ecc')

const params = {
  username: config.get('test:username'),
  WIF: config.get('test:WIF')
}

const complaints = [
  {author: 'rusovds', permlink: 'test', reason: COMPLAINT.REASON.SPAM},
  {author: 'rusovds', permlink: '4o6mut-test', reason: COMPLAINT.REASON.DEFAMATION},
  {author: 'rusovds', permlink: 'test2', reason: COMPLAINT.REASON.DEFAMATION},
  {author: 'golosio', permlink: 'golos-io-zhizn-posle-khardforka', reason: COMPLAINT.REASON.STOLEN_CONTENT}
]


module.exports = STORAGE => {
  const request = STORAGE.chai.request
  const BASE_URL = STORAGE.BASE_URL

  describe('Complaints', function() {
    describe('#POST /complaints', function() {
      function buildRequest(data, sign) {
        let req = request(BASE_URL).post('/complaints').set('Accept', 'application/json')
        if (sign) req = req.set('X-Sign', sign)
        if (data) req = req.send(data)
        return req
      }

      it('Try create complaint without sign, return error, status 401', function(done) {
        buildRequest({})
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })

      it('Try create complaint with bad sign, return error, status 401', function(done) {
        const data = {
          username: params.username,
          author: 'rusovds',
          permlink: 'test',
          reason: COMPLAINT.REASON.SPAM,
          comment: 'some text'
        }
        const sign = Signature.sign('wrong', params.WIF).toHex()
        buildRequest(data, sign)
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })

      it('Create invalid complaint with sign, return error, status 422', function(done) {
        const data = {
          username: params.username,
          author: 'rusovds',
          permlink: 'test',
          reason: 9999,
        }
        const sign = Signature.sign(JSON.stringify(data), params.WIF).toHex()

        buildRequest(data, sign)
          .end((err, res) => {
            res.should.have.status(422)
            res.body.should.have.property('details')
            res.body.details.should.have.property('comment')
            res.body.details.should.have.property('reason')
            done()
          })
      })

      it('Create complaint with bad post, with sign, return error, status 400', function(done) {
        const data = {
          username: params.username,
          permlink: 'post-never-exists',
          reason: COMPLAINT.REASON.SPAM,
          comment: 'it is spam!!!'
        }
        const sign = Signature.sign(JSON.stringify(data), params.WIF).toHex()

        buildRequest(data, sign)
          .end((err, res) => {
            res.should.have.status(400)
            done()
          })
      })

      complaints.forEach(complaint => {
        it(`Create valid complaint(${complaint.permlink}), with sign, return complaint, status 200`, function(done) {
          const data = Object.assign({
            username: params.username,
            author: 'rusovds',
            comment: 'it is comment!!!'
          }, complaint)

          const sign = Signature.sign(JSON.stringify(data), params.WIF).toHex()

          buildRequest(data, sign)
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.have.property('id')
              res.body.should.have.property('username')
              res.body.should.have.property('postId')
              res.body.should.have.property('reason')
              res.body.should.have.property('created')
              res.body.should.have.property('comment')
              done()
            })
        })
      })

      it('Create valid complaint again, with sign, return error, status 422', function(done) {
        const data = {
          username: params.username,
          author: 'rusovds',
          permlink: 'test',
          reason: COMPLAINT.REASON.DEFAMATION,
          comment: 'it is spam!!!'
        }
        const sign = Signature.sign(JSON.stringify(data), params.WIF).toHex()

        buildRequest(data, sign)
          .end((err, res) => {
            res.should.have.status(422)
            res.body.should.have.property('details')
            res.body.details.should.have.property('username')
            done()
          })
      })
    })

    describe('#GET /complaints', function() {
      function buildRequest(token, query) {
        let req = request(BASE_URL).get('/complaints').set('Accept', 'application/json')
        if (query) req = req.query(query)
        if (token) req = req.set('Authorization', 'Bearer ' + token)
        return req
      }

      it('Try get complaints without permission, return error, status 401', function(done) {
        buildRequest()
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })

      const roles = ['user', 'admin']
      roles.forEach(role => {
        it(`Get complaints with ${role} permission, return complaints collection[${complaints.length}], status 200`, function(done) {
          buildRequest(STORAGE.tokens[role])
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.an('array')
              res.body.length.should.be.eql(complaints.length)
              done()
            })
        })
      })

      const filters = [
        {type: 'by reason(SPAM)', count: 1, query: {reason: COMPLAINT.REASON.SPAM}},
        {type: 'by reason(DEFAMATION)', count: 2, query: {reason: COMPLAINT.REASON.DEFAMATION}},
        {type: 'by created, get start from now + 1 second', count: 0, query: {start: null}},
        {type: 'by created, get end now + 1 second', count: 4, query: {end: null}}
      ]

      filters.forEach(filter => {
        it(`Filter ${filter.type}, return complaints collection[${filter.count}], status 200`, function(done) {
          if ('start' in filter.query) filter.query.start = moment().unix() + 1
          if ('end' in filter.query) filter.query.end = moment().unix() + 1

          buildRequest(STORAGE.tokens.user, filter.query)
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.an('array')
              res.body.length.should.be.eql(filter.count)
              done()
            })
        })
      })
    })

    describe('#GET /complaints/top', function() {
      function buildRequest(token, query) {
        let req = request(BASE_URL).get('/complaints/top').set('Accept', 'application/json')
        if (query) req = req.query(query)
        if (token) req = req.set('Authorization', 'Bearer ' + token)
        return req
      }

      it('Try get top complaints without permission, return error, status 401', function(done) {
        buildRequest()
          .end((err, res) => {
            res.should.have.status(401)
            done()
          })
      })

      const roles = ['user', 'admin']
      roles.forEach(role => {
        it(`Get top complaints with ${role} permission, return complaints collection[${complaints.length}], status 200`, function(done) {
          buildRequest(STORAGE.tokens[role])
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.an('array')
              res.body.length.should.be.eql(complaints.length)
              done()
            })
        })
      })


      const filters = [
        {type: 'by reason(SPAM)', count: 1, query: {reason: COMPLAINT.REASON.SPAM}},
        {type: 'by reason(DEFAMATION)', count: 2, query: {reason: COMPLAINT.REASON.DEFAMATION}},
        {type: 'by created, get start from now + 1 second', count: 0, query: {start: null}},
        {type: 'by created, get end now + 1 second', count: 4, query: {end: null}},
        {type: 'by author, only golosio posts', count: 1, query: {author: 'golosio'}}
      ]

      filters.forEach(filter => {
        it(`Filter ${filter.type}, return complaints collection[${filter.count}], status 200`, function(done) {
          if ('start' in filter.query) filter.query.start = moment().unix() + 1
          if ('end' in filter.query) filter.query.end = moment().unix() + 1

          buildRequest(STORAGE.tokens.user, filter.query)
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.an('array')
              res.body.length.should.be.eql(filter.count)
              if (filter.count) {
                res.body[0].should.have.property('count')
                res.body[0].should.have.property('author')
                res.body[0].should.have.property('permlink')
              }
              done()
            })
        })
      })
    })

    describe('#GET /complaints/slice', function() {
      function buildRequest(query) {
        let req = request(BASE_URL).get('/complaints/slice').set('Accept', 'application/json')
        if (query) req = req.query(query)
        return req
      }

      it(`Get slice complaints with bad query, return error, status 400`, function(done) {
        buildRequest({})
          .end((err, res) => {
            res.should.have.status(400)
            done()
          })
      })

      it(`Get slice complaints with not exists post, return error, status 400`, function(done) {
        buildRequest({author: 'test', permlink: 'test'})
          .end((err, res) => {
            res.should.have.status(200)
            done()
          })
      })

      it(`Get slice complaints, return slice object, status 200`, function(done) {
        buildRequest(complaints[0])
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            done()
          })
      })
    })
  })
}