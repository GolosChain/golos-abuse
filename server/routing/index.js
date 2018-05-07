const fs = require('fs')
const HttpStatus = require('http-status-codes')
const golos = require('../core/golos')
const {Signature, PublicKey} = require('steem/lib/auth/ecc')

const {USER} = require('app@constants')

const UnauthorizedError = require('../errors/UnauthorizedError')


const checkAdmin = (req, res, next) => {
  if (req.user.role === USER.ROLE.ADMIN)
    next()
  else
    res.status(HttpStatus.UNAUTHORIZED).send(new UnauthorizedError())
}

const checkSign = async (req, res, next) => {
  const {username} = req.body
  const sign = req.headers['x-sign']

  if (username && sign) {
    const account = await golos.getAccount({username})

    const key = account.posting.key_auths[0][0]
    const publicKey = PublicKey.fromString(key, 'GLS')
    const signature = Signature.fromHex(sign)
    if (signature.verifyBuffer(new Buffer(JSON.stringify(req.body)), publicKey))
      next()
    else
      res.status(HttpStatus.UNAUTHORIZED).send(new UnauthorizedError())

  } else
    res.status(HttpStatus.UNAUTHORIZED).send(new UnauthorizedError())
}

module.exports = app => {
  const AuthController = require('../controllers/AuthController')
  const UserController = require('../controllers/UserController')
  const ComplaintController = require('../controllers/ComplaintController')
  const passport = require('../core/passport')

  app.route('/auth')
    .post(AuthController.auth)

  app.route('/users')
    .get(passport.authenticate('jwt', {session: false}), checkAdmin, UserController.find)
    .post(passport.authenticate('jwt', {session: false}), checkAdmin, UserController.create)

  app.route('/users/:id')
    .put(passport.authenticate('jwt', {session: false}), checkAdmin, UserController.update)

  app.route('/complaints')
    .post(checkSign, ComplaintController.create)
    .get(passport.authenticate('jwt', {session: false}), ComplaintController.find)

  app.route('/complaints/slice')
    .get(ComplaintController.slice)

  app.route('/complaints/top')
    .get(passport.authenticate('jwt', {session: false}), ComplaintController.top)


  app.route('/swagger.json')
    .get((req, res) => {
      fs.createReadStream(__dirname + '/../swagger.json').pipe(res)
    })
}