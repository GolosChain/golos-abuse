process.env.NODE_ENV = 'test'
const config = require('@config')

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

const insertTestData = require('./data/insert-test-data')
const storage = {
  BASE_URL: `http://127.0.0.1:${config.get('server:port')}`,
  chai,
  data: insertTestData.data
}

const requireFn = module => {
  require(`${__dirname}/modules/${module}`)(storage)
}

const main = async () => {
  storage.app = await require('../index')()
  await insertTestData.init(storage.app)

  describe('REST API TESTS', function() {
    describe('Modules', function() {
      const modules = [
        'controllers/AuthController',
        'controllers/UserController',
        'controllers/ComplaintController'
      ]
      modules.forEach(requireFn)
    })

    after(() => {
      storage.app.quit()
    })
  })

  run()
}

main()
