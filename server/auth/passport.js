const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const config = require('@config')
const { USER } = require('@constants')
const { User } = require('models')

const jwtOptions = {}
jwtOptions.jwtFromRequest = req => ExtractJwt.fromAuthHeaderAsBearerToken()(req) || req.query.token

jwtOptions.secretOrKey = config.get('JWT:secret')

const strategy = new JwtStrategy(jwtOptions, async function(jwt_payload, next) {
  try {
    const user = await User.findOne({
      where: { id: jwt_payload.id },
      fields: ['id', 'email', 'createdAt', 'updatedAt']
    })
    if (user) next(null, user)
    else next(null, null)
  } catch (err) {
    next(err, false)
  }
})

passport.use(strategy)

module.exports = passport
