
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const {USER} = require('app@constants')

const config = require('../config')
const app = require('./app')

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = config.get('JWT:secret')

const strategy = new JwtStrategy(jwtOptions, async function(jwt_payload, next) {
  try {
    const user = await app.models.User.findOne({id: jwt_payload.id, status: USER.STATUS.ACTIVE})

    if (user)
      next(null, user)
    else
      next(null, null)
  } catch (e) {
    next(err, false)
  }
})

passport.use(strategy)


module.exports = passport
