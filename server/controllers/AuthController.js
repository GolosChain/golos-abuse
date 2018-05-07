
const HttpStatus = require('http-status-codes')
const jwt = require('jsonwebtoken')

const config = require('../config')
const app = require('../core/app')
const passport = require('../core/passport')
const UnauthorizedError = require('../errors/UnauthorizedError')

module.exports.auth = async (req, res) => {
  const {email, password} = req.body

  if (email && password) {
    const user = await app.models.User.findOne({email})
    if (user) {
      const token = jwt.sign({id: user.id}, config.get('JWT:secret'))
      res.status(HttpStatus.OK).send({token})
    } else
      res.status(HttpStatus.UNAUTHORIZED).send(new UnauthorizedError())
  } else {
    res.status(HttpStatus.UNAUTHORIZED).send(new UnauthorizedError())
  }
}