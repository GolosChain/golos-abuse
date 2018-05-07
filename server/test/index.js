process.env.NODE_ENV = 'test'

const STORAGE = require('./data/storage')

const clearTarantool = async tarantool => {
  await tarantool.call('sql', 'DELETE FROM users')
  await tarantool.call('sql', 'DELETE FROM complaints')
  await tarantool.call('sql', 'DELETE FROM posts')
}

describe('API', function() {
  this.timeout(60000)
  before(async function() {
    STORAGE.app = await require('../index')()
    await clearTarantool(STORAGE.app.tarantool)

    let sql = `INSERT INTO users VALUES(NULL, 'admin@domain.com', '$2b$10$HmMMiFfH8AY5CUm84MiLLOhTocKpHDCLlUO/BxJTt8Wb3Xd2S5mZK', 2, 1, 1525242582)`
    await STORAGE.app.tarantool.call('sql', sql)
    sql = `INSERT INTO users VALUES(NULL, 'user@domain.com', '$2b$10$HmMMiFfH8AY5CUm84MiLLOhTocKpHDCLlUO/BxJTt8Wb3Xd2S5mZK', 1, 1, 1525242582)`
    await STORAGE.app.tarantool.call('sql', sql)
  })

  describe('Modules', function() {
    [
      'auth',
      'users',
      'complaints'
    ].forEach(module => {
      require(`${__dirname}/modules/${module}`)(STORAGE)
    })
  })

  after(async function() {
    await clearTarantool(STORAGE.app.tarantool)
    STORAGE.app.quit()
  })
})
