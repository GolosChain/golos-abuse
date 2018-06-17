const { USER } = require('@constants')

module.exports = ({
  storage,
  ctrlPath,
  modelName,
  methods,
  access = [USER.ROLES.ADMIN],
  fields
}) => {
  const request = storage.chai.request
  const BASE_URL = storage.BASE_URL

  if (methods.create) {
    describe(`#POST /${ctrlPath}`, function() {
      function buildRequest({ data = null, token = null } = {}) {
        let req = request(BASE_URL)
          .post(`/${ctrlPath}`)
          .set('Accept', 'application/json')
        if (token) req.set('Authorization', 'Bearer ' + token)
        if (data) req.send(data)
        return req
      }

      it(`Try create ${modelName} without token, return error, status 401`, async () => {
        const res = await buildRequest()
        res.should.have.status(401)
      })

      it(`Try create ${modelName} with user token, return error, status 401`, async () => {
        const token = storage.data.tokens[USER.ROLES.USER]
        const res = await buildRequest({ token })
        res.should.have.status(401)
      })

      const cases = methods.create.cases
      cases.forEach(caseItem => {
        it(`Try create ${modelName}, admin, invalid [${JSON.stringify(caseItem.data)}], errors[${
          caseItem.errors
        }], 422`, async () => {
          const token = storage.data.tokens[USER.ROLES.ADMIN]
          const data = caseItem.data
          const res = await buildRequest({ data, token })
          res.should.have.status(422)
          res.body.should.have.property('code')
          res.body.code.should.be.eql('UnprocessableEntityError')
          res.body.should.have.property('errors')
          res.body.errors.length.should.be.eql(caseItem.errors.length)
          for (err of res.body.errors) {
            const inErrors = !!~caseItem.errors.indexOf(err.field)
            inErrors.should.be.eql(true)
          }
        })
      })

      it(`Try create ${modelName} with admin token, valid data, return new ${modelName}, status 200`, async () => {
        const token = storage.data.tokens[USER.ROLES.ADMIN]
        const data = methods.create.validData
        const res = await buildRequest({ data, token })
        res.should.have.status(200)

        for (field of fields) {
          res.body.should.have.property(field)
        }
        storage.data[ctrlPath].push(res.body)
      })
    })
  }

  if (methods.update) {
    describe(`#PUT /${ctrlPath}/:id`, function() {
      function buildRequest({ data = null, token = null } = {}) {
        const last = storage.data[ctrlPath][storage.data[ctrlPath].length - 1]
        let req = request(BASE_URL)
          .put(`/${ctrlPath}/${last.id}`)
          .set('Accept', 'application/json')
        if (token) req.set('Authorization', 'Bearer ' + token)
        if (data) req.send(data)
        return req
      }

      it(`Try update ${modelName} without token, return error, status 401`, async () => {
        const res = await buildRequest()
        res.should.have.status(401)
      })

      it(`Try update ${modelName} with user token, return error, status 401`, async () => {
        const token = storage.data.tokens[USER.ROLES.USER]
        const res = await buildRequest({ token })
        res.should.have.status(401)
      })

      const cases = methods.update.cases

      cases.forEach(caseItem => {
        it(`Try update ${modelName}, admin, invalid [${JSON.stringify(caseItem.data)}], errors[${
          caseItem.errors
        }], 422`, async () => {
          const token = storage.data.tokens[USER.ROLES.ADMIN]
          const data = caseItem.data
          const res = await buildRequest({ data, token })

          res.should.have.status(422)
          res.body.should.have.property('code')
          res.body.code.should.be.eql('UnprocessableEntityError')
          res.body.should.have.property('errors')
          res.body.errors.length.should.be.eql(caseItem.errors.length)
          for (err of res.body.errors) {
            const inErrors = !!~caseItem.errors.indexOf(err.field)
            inErrors.should.be.eql(true)
          }
        })
      })

      it(`Try update ${modelName} with admin token, valid data, return new user, status 200`, async () => {
        const token = storage.data.tokens[USER.ROLES.ADMIN]
        const data = methods.update.validData
        const res = await buildRequest({ data, token })
        res.should.have.status(200)
        for (field of fields) {
          res.body.should.have.property(field)
        }
      })
    })
  }

  if (methods.findAll) {
    describe(`#GET /${ctrlPath}`, function() {
      function buildRequest({ query = null, token = null } = {}) {
        let req = request(BASE_URL)
          .get(`/${ctrlPath}`)
          .set('Accept', 'application/json')
        if (token) req.set('Authorization', 'Bearer ' + token)
        if (query) req.query(query)
        return req
      }

      it(`Try get ${ctrlPath} without token, return error, status 401`, async () => {
        const res = await buildRequest()
        res.should.have.status(401)
      })

      for (const role in USER.ROLES) {
        if (!~access.indexOf(USER.ROLES[role])) {
          it(`Try get ${ctrlPath} with ${role} token, return error, status 401`, async () => {
            const token = storage.data.tokens[USER.ROLES[role]]
            const res = await buildRequest({ token })
            res.should.have.status(401)
          })
        } else {
          it(`Try get ${ctrlPath} with ${role} token, return array, status 200`, async () => {
            const token = storage.data.tokens[USER.ROLES[role]]
            const res = await buildRequest({ token })
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('data')
            res.body.data.should.be.an('array')
            res.body.should.have.property('count')
          })
        }
      }

      const cases = methods.findAll.cases

      cases.forEach(caseItem => {
        it(`Try get ${ctrlPath}, admin, filter [${caseItem.filter}], count[${
          caseItem.count
        }], 200`, async () => {
          const token = storage.data.tokens[USER.ROLES.ADMIN]
          const query = { filter: caseItem.filter }
          const res = await buildRequest({ query, token })
          res.should.have.status(200)
          res.body.should.have.property('data')
          res.body.should.have.property('count')
          res.body.data.length.should.be.eql(caseItem.count)
        })
      })
    })
  }

  if (methods.findById) {
    describe(`#GET /${ctrlPath}/:id`, function() {
      function buildRequest({ data = null, token = null } = {}) {
        const last = storage.data[ctrlPath][storage.data[ctrlPath].length - 1]
        let req = request(BASE_URL)
          .put(`/${ctrlPath}/${last.id}`)
          .set('Accept', 'application/json')
        if (token) req.set('Authorization', 'Bearer ' + token)
        if (data) req.send(data)
        return req
      }

      it(`Try get ${modelName} by id without token, return error, status 401`, async () => {
        const res = await buildRequest()
        res.should.have.status(401)
      })

      it(`Try get ${modelName} by id with user token, return error, status 401`, async () => {
        const token = storage.data.tokens[USER.ROLES.USER]
        const res = await buildRequest({ token })
        res.should.have.status(401)
      })

      it(`Try get ${modelName} by id, admin, return ${modelName}, 200`, async () => {
        const token = storage.data.tokens[USER.ROLES.ADMIN]
        const res = await buildRequest({ token })
        res.should.have.status(200)
        for (field of fields) {
          res.body.should.have.property(field)
        }
        res.body.id.should.be.eql(storage.data[ctrlPath][storage.data[ctrlPath].length - 1].id)
      })
    })
  }

  if (methods.deleteById) {
    describe(`#DELETE /${ctrlPath}/:id`, function() {
      function buildRequest({ token = null } = {}) {
        const last = storage.data[ctrlPath][storage.data[ctrlPath].length - 1]
        let req = request(BASE_URL)
          .delete(`/${ctrlPath}/${last.id}`)
          .set('Accept', 'application/json')
        if (token) req.set('Authorization', 'Bearer ' + token)
        return req
      }

      it(`Try delete ${modelName} by id without token, return error, status 401`, async () => {
        const res = await buildRequest()
        res.should.have.status(401)
      })

      it(`Try delete ${modelName} by id with user token, return error, status 401`, async () => {
        const token = storage.data.tokens[USER.ROLES.USER]
        const res = await buildRequest({ token })
        res.should.have.status(401)
      })

      it(`Try delete ${modelName} by id, admin, return ${modelName}, 200`, async () => {
        const token = storage.data.tokens[USER.ROLES.ADMIN]
        const res = await buildRequest({ token })
        res.should.have.status(200)
      })
    })
  }
}
