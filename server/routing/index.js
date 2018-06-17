const fs = require('fs')
const AuthController = require('../controllers/AuthController')
const passport = require('../auth/passport')
const authenticate = passport.authenticate('jwt', { session: false })
const { byRoles: AccessByRoles, bySign: AccessBySign } = require('../auth/AccessControl')
const {
  USER: { ROLES }
} = require('@constants')

module.exports = app => {
  // CORS
  app.route('*').all(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE')
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With,Content-Type, Accept, Authorization'
    )
    try {
      if (req.method === 'OPTIONS') res.end()
      else {
        if (req.query.filter) req.query.filter = JSON.parse(req.query.filter)
        next()
      }
    } catch (err) {
      next(err)
    }
  })

  const onlyAdmin = AccessByRoles([ROLES.ADMIN])

  // Auth routers
  const AuthController = require('../controllers/AuthController')
  app.route('/auth').post(AuthController.auth)
  app.route('/auth/current').get(authenticate, AuthController.current)
  app.route('/auth/refresh').get(authenticate, AuthController.refresh)

  // Users routers
  const UserController = require('../controllers/UserController')
  app
    .route('/users')
    .get(authenticate, onlyAdmin, UserController.findAll)
    .post(authenticate, onlyAdmin, UserController.create)

  app.route('/users/:id').put(authenticate, onlyAdmin, UserController.update)

  // Complaints routers
  const ComplaintController = require('../controllers/ComplaintController')
  app
    .route('/complaints')
    .post(AccessBySign, ComplaintController.create)
    .get(authenticate, ComplaintController.findAll)

  app.route('/complaints/top').get(authenticate, ComplaintController.top)
  app.route('/complaints/slice').get(ComplaintController.slice)

  app.route('/swagger.json').get((req, res) => {
    fs.createReadStream(__dirname + '/../swagger.json').pipe(res)
  })
}
