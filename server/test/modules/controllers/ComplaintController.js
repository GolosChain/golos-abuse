const config = require('@config')
const moment = require('moment')
const {
  COMPLAINT: { REASON },
  USER: { ROLES }
} = require('@constants')
const async = require('async')
const { Signature } = require('steem/lib/auth/ecc')

const params = {
  username: config.get('test:username'),
  WIF: config.get('test:WIF')
}

const complaints = [
  { author: 'rusovds', permlink: 'test', reason: REASON.SPAM },
  { author: 'rusovds', permlink: '4o6mut-test', reason: REASON.DEFAMATION },
  { author: 'rusovds', permlink: 'test2', reason: REASON.DEFAMATION },
  {
    author: 'golosio',
    permlink: 'golos-io-zhizn-posle-khardforka',
    reason: REASON.STOLEN_CONTENT
  }
]

module.exports = storage => {
  const request = storage.chai.request
  const BASE_URL = storage.BASE_URL

  describe('Complaints', function() {
    describe('#POST /complaints', function() {
      function buildRequest(data, sign) {
        let req = request(BASE_URL)
          .post('/complaints')
          .set('Accept', 'application/json')
        if (sign) req = req.set('X-Sign', sign)
        if (data) req = req.send(data)
        return req
      }

      it('Try create complaint without sign, return error, status 401', async () => {
        const res = await buildRequest()
        res.should.have.status(401)
      })

      it('Try create complaint with bad sign, return error, status 401', async () => {
        const data = {
          username: params.username,
          author: 'rusovds',
          permlink: 'test',
          reason: REASON.SPAM,
          comment: 'some text'
        }
        const sign = Signature.sign('wrong', params.WIF).toHex()
        const res = await buildRequest(data, sign)
        res.should.have.status(401)
      })

      it('Create invalid complaint with sign, return error, status 422', async () => {
        const data = {
          username: params.username,
          author: 'rusovds',
          permlink: 'test',
          reason: 9999
        }
        const sign = Signature.sign(JSON.stringify(data), params.WIF).toHex()
        const res = await buildRequest(data, sign)
        res.should.have.status(422)
        res.body.should.have.property('errors')
        const fields = ['comment', 'reason']
        for (err of res.body.errors) {
          const inErrors = !!~fields.indexOf(err.field)
          inErrors.should.be.eql(true)
        }
      })

      it('Create complaint with bad post, with sign, return error, status 400', async () => {
        const data = {
          username: params.username,
          permlink: 'post-never-exists',
          reason: REASON.SPAM,
          comment: 'it is spam!!!'
        }
        const sign = Signature.sign(JSON.stringify(data), params.WIF).toHex()
        const res = await buildRequest(data, sign)
        res.should.have.status(400)
      })

      complaints.forEach(complaint => {
        const { permlink } = complaint
        it(`Create valid complaint(${permlink}), with sign, return complaint, status 200`, async () => {
          const data = Object.assign(
            {
              username: params.username,
              author: 'rusovds',
              comment: 'it is comment!!!'
            },
            complaint
          )
          const sign = Signature.sign(JSON.stringify(data), params.WIF).toHex()
          const res = await buildRequest(data, sign)
          res.should.have.status(200)
          res.body.should.have.property('id')
          res.body.should.have.property('username')
          res.body.should.have.property('postId')
          res.body.should.have.property('reason')
          res.body.should.have.property('createdAt')
          res.body.should.have.property('comment')
        })
      })

      it('Create valid complaint again, with sign, return error, status 422', async () => {
        const data = {
          username: params.username,
          author: 'rusovds',
          permlink: 'test',
          reason: REASON.DEFAMATION,
          comment: 'it is spam!!!'
        }
        const sign = Signature.sign(JSON.stringify(data), params.WIF).toHex()

        const res = await buildRequest(data, sign)
        res.should.have.status(422)
        res.body.should.have.property('errors')
        const fields = ['username', 'postId']
        for (err of res.body.errors) {
          const inErrors = !!~fields.indexOf(err.field)
          inErrors.should.be.eql(true)
        }
      })
    })

    require('../RestController')({
      storage,
      access: [ROLES.USER, ROLES.ADMIN],
      ctrlPath: 'complaints',
      modelName: 'complaint',
      fields: ['id', 'username', 'postId', 'reason', 'comment', 'createdAt'],
      methods: {
        findAll: {
          cases: [
            { filter: JSON.stringify({ where: { reason: REASON.SPAM } }), count: 1 },
            { filter: JSON.stringify({ where: { reason: REASON.DEFAMATION } }), count: 2 },
            { filter: JSON.stringify({ where: { username: 'rusovds' } }), count: 4 }
          ]
        }
      }
    })

    
    // describe('#GET /complaints/top', function() {
    //   function buildRequest(token, query) {
    //     let req = request(BASE_URL).get('/complaints/top').set('Accept', 'application/json')
    //     if (query) req = req.query(query)
    //     if (token) req = req.set('Authorization', 'Bearer ' + token)
    //     return req
    //   }

    //   it('Try get top complaints without permission, return error, status 401', function(done) {
    //     buildRequest()
    //       .end((err, res) => {
    //         res.should.have.status(401)
    //         done()
    //       })
    //   })

    //   const roles = ['user', 'admin']
    //   roles.forEach(role => {
    //     it(`Get top complaints with ${role} permission, return complaints collection[${complaints.length}], status 200`, function(done) {
    //       buildRequest(STORAGE.tokens[role])
    //         .end((err, res) => {
    //           res.should.have.status(200)
    //           res.body.should.be.an('array')
    //           res.body.length.should.be.eql(complaints.length)
    //           done()
    //         })
    //     })
    //   })

    //   const filters = [
    //     {type: 'by reason(SPAM)', count: 1, query: {reason: REASON.SPAM}},
    //     {type: 'by reason(DEFAMATION)', count: 2, query: {reason: REASON.DEFAMATION}},
    //     {type: 'by created, get start from now + 1 second', count: 0, query: {start: null}},
    //     {type: 'by created, get end now + 1 second', count: 4, query: {end: null}},
    //     {type: 'by author, only golosio posts', count: 1, query: {author: 'golosio'}}
    //   ]

    //   filters.forEach(filter => {
    //     it(`Filter ${filter.type}, return complaints collection[${filter.count}], status 200`, function(done) {
    //       if ('start' in filter.query) filter.query.start = moment().unix() + 1
    //       if ('end' in filter.query) filter.query.end = moment().unix() + 1

    //       buildRequest(STORAGE.tokens.user, filter.query)
    //         .end((err, res) => {
    //           res.should.have.status(200)
    //           res.body.should.be.an('array')
    //           res.body.length.should.be.eql(filter.count)
    //           if (filter.count) {
    //             res.body[0].should.have.property('count')
    //             res.body[0].should.have.property('author')
    //             res.body[0].should.have.property('permlink')
    //           }
    //           done()
    //         })
    //     })
    //   })
    // })

    // describe('#GET /complaints/slice', function() {
    //   function buildRequest(query) {
    //     let req = request(BASE_URL).get('/complaints/slice').set('Accept', 'application/json')
    //     if (query) req = req.query(query)
    //     return req
    //   }

    //   it(`Get slice complaints with bad query, return error, status 400`, function(done) {
    //     buildRequest({})
    //       .end((err, res) => {
    //         res.should.have.status(400)
    //         done()
    //       })
    //   })

    //   it(`Get slice complaints with not exists post, return error, status 400`, function(done) {
    //     buildRequest({author: 'test', permlink: 'test'})
    //       .end((err, res) => {
    //         res.should.have.status(200)
    //         done()
    //       })
    //   })

    //   it(`Get slice complaints, return slice object, status 200`, function(done) {
    //     buildRequest(complaints[0])
    //       .end((err, res) => {
    //         res.should.have.status(200)
    //         res.body.should.be.an('object')
    //         done()
    //       })
    //   })
    // })
  })
}
